import { useState, useEffect } from 'react'
import { ethers } from 'ethers';
import abi from './assets/abi.json'
import './App.css'
import AddBank from './components/AddBank';
//import { Button } from 'react-bootstrap';

function App() {


  const [state, setState] = useState({
    Contract: null,
    Account: null,
    Signer: null,
    Provider: null
  })

  const [Connected, setConnected] = useState(false);

  const connect = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      let contractAddress = "0x38987117F19CA94d3B33bCE16a33ff4f12D773c3";
      const contract = new ethers.Contract(contractAddress, abi, signer);
      setState({ Contract: contract, Account: address, Signer: signer, Provider: provider });
      setConnected(true);
      console.log(state.Contract)
      console.log(state.Account)

    }
    catch (error) {
      alert("Please install metamask");
    }
  }


  return (
    <>
      <h1 >Welcome to the Registry portal !</h1>
      <h2  >Please connect your wallet</h2>
      <button onClick={connect}  >
        {!Connected ? "Connect MetaMask" : ""}
        <h5 hidden={!Connected} >Owner : {state.Account}</h5>
      </button>

      <AddBank Contract={state.Contract} />
    </>
  )
}

export default App
