<script>
  export let data = {};

  async function postData(url = "", data = {}) {
    // Default options are marked with *
    const response = await fetch(url, {
      method: "PATCH", // *GET, POST, PUT, DELETE, etc.
      mode: "no-cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: "follow", // manual, *follow, error
      referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(data), // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
  }

  function submit() {
    console.log("hello");
    postData("http://localhost:1337", { ...data}).then((data) => {
      console.log(data); // JSON data parsed by `data.json()` call
    });
  }
</script>

<div class="card">
  <header>
    <h4>Enter cocoa item</h4>
  </header>
  <div class="row">
    <label class="col">Farmer ID</label>
    <input class="col" type="text" bind:value={data.ID} />
  </div>
  <div class="row">
    <label class="col">Cocoa Type</label>
    <input class="col" type="text" bind:value={data.cocoaType} />
  </div>
  <div class="row">
    <label class="col">Price</label>
    <input class="col" type="text" bind:value={data.price} />
  </div>
  <div class="row">
    <label class="col">Bag Weight</label>
    <input class="col" type="text" bind:value={data.bagWeight} />
  </div>

  <footer class="is-right">
    <a class="button primary" on:click={submit}>Submit</a>
  </footer>
</div>