import { useState, useEffect } from "react";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import { ethers } from "ethers";
import "./App.css";
import Counter from "./Counter.json";
import getWeb3 from "./web3";
import { CircularProgress, Stack, TextField } from "@mui/material";

function App() {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState(null);
  const [contractData, setContractData] = useState(null);
  const [count, setCount] = useState();
  const [productCount, setProductCount] = useState();
  const [productData, setProductData] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ipfsHash, setIpfsHash] = useState("");

  useEffect(() => {
    const init = async () => {
      const web3 = await getWeb3();
      setWeb3(web3);

      const accounts = await web3.eth.getAccounts();
      setAccounts(accounts);

      const networkId = await web3.eth.net.getId();
      console.log('networkId',networkId);
      console.log('Deployed network IDs:', Counter);
      const deployedNetwork = Counter.networks[networkId.toString()];
      if (!deployedNetwork) {
        console.error(`Contract not deployed on network with id ${networkId}`);
        return;
      }
      console.log('deployedNetwork',deployedNetwork);
      const instance = new web3.eth.Contract(
        Counter.abi,
        deployedNetwork && deployedNetwork.address,
      );
      console.log('instance',instance);
      setContractData(instance);
    };

    init();

  }, []);

  // const uploadImageToIPFS = async (contract) => {
  //   const uploadResult = await ipfs.add(file);
  //   setIpfsHash(uploadResult.path);
  //   await contract.methods.storeImage(uploadResult.path).send({ from: contractData?._address });
  // };

  // const uploadImage = async (contract) => {
  //   // const reader = new window.FileReader();
  //   // reader.readAsArrayBuffer(file);
  //   // reader.onloadend = async () => {
  //   //   const buffer = reader.result;
  //     await uploadImageToIPFS(contract);
  //   // };
  // };  

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await readProductsValue();
      return data;
    };
    if(contractData){
      fetchProducts().catch(console.error);
    }
  }, [contractData]);

  async function requestAccount() {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  }
  async function getTokenDetails(contract,tokenId) {
    // const owner = await contract.ownerOf(tokenId);
    const product = await contract.getProduct(tokenId); // Assuming you have a getProduct function
    console.log(`Token ID: ${tokenId}`);
    // console.log(`Owner: ${owner}`);
    console.log(`Product Name: ${product.name}`);
    console.log(`Product Price: ${product.price}`);
    console.log("--------------");
  }

  async function getAllTokenDetails(contract) {
    const totalTokens = await contract.getProductsCount(); // Assuming you have a getProductsCount function
    for (let i = 0; i < totalTokens; i++) {
        await getTokenDetails(contract,i);
    }
  }
  async function readProductsValue() {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        contractData?._address,
        Counter.abi,
        provider
      );
      // await getAllTokenDetails(contract)
      console.log("contract", contract);
      try {
        const data = await contract.getProductsCount();
        const getAllProductData = await contract.getAllProducts();
        console.log("getAllProductData : ", getAllProductData);
        console.log("data 1 : ", data);
        console.log("data 2 : ", parseInt(data.toString()));
        setProductCount(parseInt(data.toString()));
        setProductData(getAllProductData)
      } catch (err) {
        console.log("Error: ", err);
        alert(
          "Switch your MetaMask network to Polygon zkEVM testnet and refresh this page!"
        );
      }
    }
  }

  async function createProduct() {
    try{
      if (typeof window.ethereum !== "undefined") {
        if(!name){
          alert("Please enter product name");
          return;
        }else if(!price){
          alert("Please enter product price");
          return;
        } else if (isNaN(parseInt(price))) {
          alert("Please enter valid price");
          return;
        }
        await requestAccount();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        console.log('provider-----',provider );
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractData?._address, Counter.abi, signer);
        // const imageHash = await uploadImage(contract);
        // const priceInWei = ethers.utils.parseEther(price);
        // let transaction = await contract.createProduct(name,price,ipfsHash);
        let transaction = await contract.createProduct(name,price);
        setIsLoading(true);
        await transaction.wait();
        setIsLoading(false);
        setName('')
        setPrice('')
        readProductsValue();
      }
    }catch(error){
      console.log('createProduct error---',error);
      if(error.code=='ACTION_REJECTED'){
        alert(`Transaction denied by user`)
      }else{
        alert(`Transaction failed`)
      }
    }
  }

  async function purchaseProduct(data,productPrice) {
    try{
      if (typeof window.ethereum !== "undefined") {
        await requestAccount();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        console.log('provider-----',provider );
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractData?._address, Counter.abi, signer);
        const estimatedGas = await contract.estimateGas.purchaseProduct(data, {
          value: productPrice  // Assuming productPrice is the price of the product in Ether
        });
        const gasLimit = estimatedGas.mul(2);  // Doubling the estimated gas limit
        let transaction = await contract.purchaseProduct(data, {
          value: productPrice,  // Assuming productPrice is the price of the product in Ether
          gasLimit: gasLimit  // Set the increased gas limit
        });
        setIsLoading(true);
        await transaction.wait();
        setIsLoading(false);
        readProductsValue();
      }
    }catch(error){
      console.log('purchaseProduct error : ',error);
    }
  }

  const addProduct = async () => {
    await createProduct();
  };
  const buyProduct = async (data,productPrice) => {
    await purchaseProduct(data,productPrice);
  };

  return (
    <Container maxWidth="lg">
      <Card sx={{ p:5, m:5, alignItems:'center',justifyContent:'center' }}>
        <CardContent>
          <Stack flexDirection={"row"} justifyContent={'center'} gap={2}>
          {/* <input type="file" name="file" required onChange={(event)=>setFile(event.target.files[0])} /> */}
          <TextField label='Name' value={name} placeholder="Product Name" onChange={(e)=>setName(e.target.value)}/>
          <TextField label='Price' value={price} placeholder="Price in ETH" onChange={(e)=>setPrice(e.target.value)} />
          </Stack>
          <Stack flexDirection={"row"} justifyContent={'center'}>
          <Button
            onClick={addProduct}
            variant="contained"
            disabled={isLoading}
            sx={{mt:3}}
          >
            {isLoading ? "Saving..." : "Add product"}
          </Button>
          </Stack>
          </CardContent>
      </Card>
          <p style={{marginTop:30}}>{productCount} Products</p>

        <table style={{ borderCollapse: "collapse", width: "100%", border: "1px solid black" }}>
          <thead>
            <tr>
              <th style={{ padding: "8px", border: "1px solid black" }}>Token ID</th>
              <th style={{ padding: "8px", border: "1px solid black" }}>Product Name</th>
              <th style={{ padding: "8px", border: "1px solid black" }}>Price</th>
              <th style={{ padding: "8px", border: "1px solid black" }}>Owner (Address)</th>
              <th style={{ padding: "8px", border: "1px solid black" }}>Purchased</th>
              <th style={{ padding: "8px", border: "1px solid black" }}></th>
            </tr>
          </thead>
          <tbody>
            {productData?.map((product, index) => (
              <tr key={index}>
                {/* <td style={{ padding: "8px", border: "1px solid black" }} align="center">
                  <img src={`https://gateway.ethswarm.org/bzz/${product[4]}`} alt="Product" style={{ maxWidth: "100px" }} />
                </td> */}
                <td style={{ padding: "8px", border: "1px solid black" }} align="center">{index}</td>
                <td style={{ padding: "8px", border: "1px solid black" }} align="center">{product[0]}</td>
                <td style={{ padding: "8px", border: "1px solid black" }} align="center">{product[1].toString()}</td>
                <td style={{ padding: "8px", border: "1px solid black" }} align="center">{product[2].toString()}</td>
                <td style={{ padding: "8px", border: "1px solid black" }} align="center">{product[3]===true ?  'Yes' : 'No'}</td>
                <td style={{ padding: "8px", border: "1px solid black" }} align="center">
                  <Button
                    onClick={()=>{
                      if (!product[3]) {
                        buyProduct(index, product[1].toString());
                      }
                    }}
                    variant="outlined"
                    disabled={isLoading}
                    sx={{justifyContent:'center',color:product[3]===true ?  'green' : 'red'}}
                  >
                    {isLoading ? "Please wait..." : product[3]===true ?  "Purchased" : "Buy"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

    </Container>
  );
}

export default App;
