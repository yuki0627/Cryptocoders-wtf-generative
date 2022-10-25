<template>
  <div>
    <p v-if="images.length == 0">(Fetching from the blockchain...)</p>
    <img
      v-for="image in images"
      :key="image"
      :src="image"
      class="mr-1 mb-1 inline-block w-20"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useRoute } from "vue-router";
import { addresses } from "@/utils/addresses";
import { ethers } from "ethers";
import { svgImageFromSvgPart, sampleColors } from "@/models/point";

const IAssetProvider = {
  wabi: require("@/abis/IAssetProvider.json"), // wrapped abi
};
const ISVGHelper = {
  wabi: require("@/abis/ISVGHelper.json"), // wrapped abi
};

export default defineComponent({
  props: ["assetProvider"],
  setup(props) {
    const images = ref<string[]>([]);
    const route = useRoute();
    const network =
      typeof route.query.network == "string" ? route.query.network : "goerli";
    const alchemyKey = process.env.VUE_APP_ALCHEMY_API_KEY;
    console.log("*** network", network, alchemyKey);

    // const providerAddress = addresses[props.assetProvider][network];
    // const providerAddress = "0xA084b3a45044366A6af2C0521f51Ad7948e6C7E2" //coin
    // const providerAddress = "0xEC361A1dbAa28fC36162c65E6b65D9a60138b994" //coinArt
    const providerAddress = "0x7C5Ea12E7cFf945857fC91b81329Fe41b845678e" //splatter
    // const providerAddress = "0xc050629cb7E54a88e0cB3Ab504600F5dfca60aE7" //splatterArt
    const svgHelperAddress = addresses["svgHelper"][network];
    console.log("*** address", providerAddress, svgHelperAddress);
    const provider =
      network == "localhost"
        ? new ethers.providers.JsonRpcProvider()
        : alchemyKey
        ? new ethers.providers.AlchemyProvider(network, alchemyKey)
        : new ethers.providers.InfuraProvider(network);
    const assetProvider = new ethers.Contract(
      providerAddress,
      IAssetProvider.wabi.abi,
      provider
    );
    const svgHelper = new ethers.Contract(
      svgHelperAddress,
      ISVGHelper.wabi.abi,
      provider
    );
    console.log("*** assetProvider", assetProvider.functions);

    const fetchImages = async () => {
      const newImages = [];
      for (let i = 0; i < sampleColors.length; i++) {
        const [svgPart, tag, gas] = await svgHelper.functions.generateSVGPart(
          providerAddress,
          i
        );
        // console.log("svgPart", svgPart);
        const [traits] = await assetProvider.functions.generateTraits(i);
        console.log("gas", gas.toNumber(), traits);
        const image = svgImageFromSvgPart(svgPart, tag, sampleColors[i]);
        newImages.push(image);
        images.value = newImages.map((image) => image);
      }
      images.value = newImages;
    };
    fetchImages();

    return {
      images,
      network,
    };
  },
});
</script>
