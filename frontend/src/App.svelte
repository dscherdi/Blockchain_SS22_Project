<script>
  import DataTable, { Head, Body, Row, Cell } from "@smui/data-table";
  import { Tabs, TabList, Tab, TabPanel } from "./components/tabs/tabs";
  import { Modal, Content, Popup , UpdateContent} from "./components/dialog/dialog";
  import {QRCode} from "./components/qr/qr";
  import { modal } from "./stores.js";
  let farmerId;
  let cocoaType;
  let price;
  let bagWeight;
  let dataRows = [{ ID: "123" }];
  async function postData(url = "", data = {}) {
    // Default options are marked with *
    const response = await fetch(url, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
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
    postData("https://example.com/answer", { answer: 42 }).then((data) => {
      console.log(data); // JSON data parsed by `data.json()` call
    });
  }

  function showQrCode() {}

  async function fetchData() {
    try {
      var response = await fetch("http://localhost:1337/hypercocoa/assets", {
        method: "GET", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      });
      var responsePromise = await response.json();
      responsePromise = responsePromise.filter(function (el) {
       return el.AssetType == "cocoabag";
});
      dataRows = responsePromise;
    } catch (e) {
      console.error(e);
    }
  }

  setInterval(fetchData, 5000);
</script>

<main>
  <Tabs>
    <TabList>
      <Tab>Create Cocoa Item</Tab>
      <Tab>List Cocoa Transactions</Tab>
    </TabList>

    <TabPanel>
      <div class="card">
        <header>
          <h4>Enter cocoa item</h4>
        </header>
        <div class="row">
          <label class="col">Farmer ID</label>
          <input class="col" type="text" bind:value={farmerId} />
        </div>
        <div class="row">
          <label class="col">Cocoa Type</label>
          <input class="col" type="text" bind:value={cocoaType} />
        </div>
        <div class="row">
          <label class="col">Price</label>
          <input class="col" type="text" bind:value={price} />
        </div>
        <div class="row">
          <label class="col">Bag Weight</label>
          <input class="col" type="text" bind:value={bagWeight} />
        </div>

        <footer class="is-right">
          <a class="button primary" on:click={submit}>Submit</a>
        </footer>
      </div>
    </TabPanel>

    <TabPanel>
      <DataTable table$aria-label="People list" style="max-width: 100%;">
        <Head>
          <Row>
            <Cell>ID</Cell>
            <Cell>QrCode</Cell>
            <Cell>Update</Cell>
          </Row>
        </Head>
        <Body>
          {#each dataRows as row}
            <Row>
              <Cell>{row.ID}</Cell>
              <Cell>
                <Modal show={$modal}>
                  <Content text="Show Qr code" data={row}></Content>
                </Modal>
              </Cell>
              <Cell>
                <Modal show={$modal}>
                  <UpdateContent text="Update" data={row}></UpdateContent>
                </Modal>
              </Cell>
            </Row>
          {/each}
        </Body>
      </DataTable>
    </TabPanel>
  </Tabs>
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
