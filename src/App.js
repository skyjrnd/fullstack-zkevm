import { useState, useEffect } from "react";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import { ethers } from "ethers";
import "./App.css";

import Counter from "./Counter.json";
import { CircularProgress, Stack, TextField } from "@mui/material";
const counterAddress = "0x1Bfa8519b12f552204652cA7a1734E856b1A9B15";
console.log(counterAddress, "Counter ABI: ", Counter.abi);

function App() {
  const [count, setCount] = useState();
  const [productCount, setProductCount] = useState();
  const [productData, setProductData] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCount = async () => {
      const data = await readCounterValue();
      return data;
    };
    const fetchProducts = async () => {
      const data = await readProductsValue();
      return data;
    };
    fetchCount().catch(console.error);
    fetchProducts().catch(console.error);
  }, []);

  async function readCounterValue() {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      console.log("provider", provider);
      console.log("provider.getCode(counterAddress)", await provider.getCode(counterAddress));
      const contract = new ethers.Contract(
        counterAddress,
        Counter.abi,
        provider
      );
      console.log("contract", contract);
      try {
        const data = await contract.retrieve();
        console.log("data 1 : ", data);
        console.log("data 2 : ", parseInt(data.toString()));
        setCount(parseInt(data.toString()));
      } catch (err) {
        console.log("Error: ", err);
        alert(
          "Switch your MetaMask network to Polygon zkEVM testnet and refresh this page!"
        );
      }
    }
  }

  async function requestAccount() {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  }

  async function updateCounter(data) {
    if (typeof window.ethereum !== "undefined") {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      console.log('provider-----',provider );
      const signer = provider.getSigner();
      const contract = new ethers.Contract(counterAddress, Counter.abi, signer);
      let transaction;
      if(data=='add'){
        transaction = await contract.increment();
      }else{
        transaction = await contract.decrement();
      }
      setIsLoading(true);
      await transaction.wait();
      setIsLoading(false);
      readCounterValue();
    }
  }

  async function readProductsValue() {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        counterAddress,
        Counter.abi,
        provider
      );
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
        const contract = new ethers.Contract(counterAddress, Counter.abi, signer);
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
        const contract = new ethers.Contract(counterAddress, Counter.abi, signer);
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

  const incrementCounter = async () => {
    const data = 'add'
    await updateCounter(data);
  };
  const decrementCounter = async () => {
    const data = 'subtract'
    await updateCounter(data);
  };
  const addProduct = async () => {
    await createProduct();
  };
  const buyProduct = async (data,productPrice) => {
    await purchaseProduct(data,productPrice);
  };

  return (
    <Container maxWidth="lg">
      {/* <Card sx={{ minWidth: 275, marginTop: 20 }}>
        <CardContent>
          <p>Count: {count}</p>
          <Button
            onClick={incrementCounter}
            variant="outlined"
            disabled={isLoading}
          >
            {isLoading ? "loading..." : "+1"}
          </Button>
          <Button
            onClick={decrementCounter}
            variant="outlined"
            disabled={isLoading}
            sx={{ml:3,color:'#ff0000'}}
          >
            {isLoading ? "loading..." : "-1"}
          </Button>
        </CardContent>
      </Card> */}
      <Card sx={{ p:5, m:5, alignItems:'center',justifyContent:'center' }}>
        <CardContent>
          <Stack flexDirection={"row"} justifyContent={'center'} gap={2}>
          <TextField label='Name' value={name} onChange={(e)=>setName(e.target.value)}/>
          <TextField label='Price' value={price} onChange={(e)=>setPrice(e.target.value)} />
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
