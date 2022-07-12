<script>
  export let message = 'Default message';
  import {QRCode} from "../qr/qr.js";
  export let data = {};
</script>

<style>
  h2 {
		font-size: 2rem;
		text-align: center;
	}
</style>

<QRCode codeValue={data.ID} id={data.ID} squareSize=200/>