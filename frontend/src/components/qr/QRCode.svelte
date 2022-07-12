<script>
  import { onMount } from 'svelte';
	
	export let codeValue;
	export let squareSize; 
  export let id;
	
  let qrcode;
			
	onMount(() => {
			qrcode = new QRCode("qrcode" + id, {
				text: codeValue,
		  	width: squareSize,
        height: squareSize,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
			});		
	});
</script>

<style>
  #qrcode {
    width:20px;
    height:200x;
    margin-top:15px;
  }
</style>

<div id={`qrcode${id}`}></div>

