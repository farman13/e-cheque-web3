import { useState } from 'react';
import { ethers } from 'ethers';
import abi from './assets/abi.json';
import { Button, Form } from 'react-bootstrap';
import './App.css';
import FormData from 'form-data';
import axios from 'axios';

function App() {

  const [state, setState] = useState({
    Contract: null,
    Account: null,
    Signer: null,
    Provider: null
  });

  const [Connected, setConnected] = useState(false);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [showApproveButton, setShowApproveButton] = useState(false); // New state for the "Approve" button
  const [chequeDetails, setChequeDetails] = useState({
    amount: '',
    payee: '',
    expiryDate: ''
  });
  const [chequeId, setChequeId] = useState('');
  const connect = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      let contractAddress = "0x62F3e1C1B3127D405dB092c18e65241A74FC2a16";
      const contract = new ethers.Contract(contractAddress, abi, signer);
      setState({ Contract: contract, Account: address, Signer: signer, Provider: provider });
      setConnected(true);
      console.log(contract);
      console.log(address);
    }
    catch (error) {
      alert("Please install MetaMask");
    }
  };

  const handleIssueCheque = () => {
    setShowIssueForm(true);
    setShowDepositForm(false);
    setShowApproveButton(false); // Reset approval button visibility when switching forms
  };

  const handleDepositCheque = () => {
    setShowDepositForm(true);
    setShowIssueForm(false);
    setShowApproveButton(true); // Show the "Approve" button immediately when deposit form is shown
  };

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    const { payee, amount, expiryDate } = chequeDetails;

    if (!state.Contract) {
      alert("Please connect your wallet first.");
      return;
    }

    try {
      const chequeData = { payee, amount, expiryDate };
      const fileBlob = new Blob([JSON.stringify(chequeData, null, 2)], { type: 'application/json' });

      const formData = new FormData();
      formData.append('file', fileBlob, 'chequeDetails.json');

      const response = await axios({
        method: 'post',
        url: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
        data: formData,
        headers: {
          pinata_api_key: '5b4dbd0f9a4ac7971669',
          pinata_secret_api_key: '0932cca1141a0e851955dfb865ca97833bf9e67a150e390facf77b1a535d859f',
          'Content-Type': 'multipart/form-data'
        }
      });

      const ipfsHash = response.data.IpfsHash;
      console.log('File uploaded to IPFS with hash:', ipfsHash);
      const ImgUri = `https://lime-tricky-cephalopod-329.mypinata.cloud/ipfs/${ipfsHash}`;
      const txn = await state.Contract.issueCheque(payee, ethers.utils.parseUnits(amount, "ether"), expiryDate, ImgUri);
      await txn.wait();
      console.log('Cheque Issued:', txn);
      alert("Cheque issued successfully!");
    } catch (error) {
      console.error("Error issuing cheque:", error);
      alert("Failed to issue cheque. Please check the console for details.");
    }
  };

  const handleDepositSubmit = async (e) => {
    e.preventDefault();

    if (!state.Contract) {
      alert("Please connect your wallet first.");
      return;
    }

    const tokenId = parseInt(chequeId, 10);

    if (isNaN(tokenId)) {
      alert("Please enter a valid Cheque ID.");
      return;
    }

    try {
      const txn = await state.Contract.depositCheque(tokenId);
      await txn.wait();
      console.log('Cheque Deposited:', txn);
      alert("Cheque deposited successfully!");

      setShowApproveButton(false); // Hide the "Approve" button after the deposit is submitted
    } catch (error) {
      console.error("Error depositing cheque:", error);
      alert("Failed to deposit cheque. Please check the console for details.");
    }
  };

  const handleApprove = async (e) => {
    if (!state.Contract) {
      alert("Please connect your wallet first.");
      return;
    }

    try {
      const contractAddress = state.Contract.address;
      const tokenId = parseInt(chequeId, 10);

      if (isNaN(tokenId)) {
        alert("Please enter a valid Cheque ID.");
        return;
      }
      const Issuerbank = await state.Contract.getChequeIssuer(tokenId);
      console.log("IB:", Issuerbank);
      const issuerBankContract = new ethers.Contract(Issuerbank, abi, state.Signer);
      const txn = await issuerBankContract.approve(contractAddress, tokenId);
      await txn.wait();
      console.log('Approval granted:', txn);
      alert("Approval granted successfully!");
    } catch (error) {
      console.error("Error granting approval:", error);
      alert("Failed to grant approval. Please check the console for details.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setChequeDetails({
      ...chequeDetails,
      [name]: value
    });
  };

  return (
    <>
      <h1>Welcome to the HDFC Online Banking Portal !</h1>
      <h2>Please connect your wallet</h2>
      <button onClick={connect}>
        {!Connected ? "Connect MetaMask" : ""}
        <h5 hidden={!Connected} >Connected account : {state.Account}</h5>
      </button>
      <br />
      <Button variant="primary" size="lg" onClick={handleIssueCheque}>Issue Cheque</Button>{' '}
      <Button variant="success" size="lg" onClick={handleDepositCheque}>Deposit Cheque</Button>

      {showIssueForm && (
        <Form onSubmit={handleIssueSubmit}>
          <Form.Group controlId="formAmount">
            <Form.Label>Amount</Form.Label>
            <Form.Control
              type="text"
              name="amount"
              value={chequeDetails.amount}
              onChange={handleChange}
              placeholder="Enter amount"
            />
          </Form.Group>

          <Form.Group controlId="formPayee">
            <Form.Label>Payee</Form.Label>
            <Form.Control
              type="text"
              name="payee"
              value={chequeDetails.payee}
              onChange={handleChange}
              placeholder="Enter payee name"
            />
          </Form.Group>

          <Form.Group controlId="formExpiryDate">
            <Form.Label>Expiry Date (Unix Timestamp)</Form.Label>
            <Form.Control
              type="text"
              name="expiryDate"
              value={chequeDetails.expiryDate}
              onChange={handleChange}
              placeholder="Enter expiry date as Unix timestamp"
            />
          </Form.Group>

          <Button variant="primary" type="submit">
            Submit
          </Button>
        </Form>
      )}

      {showDepositForm && (
        <>

          <Form onSubmit={handleDepositSubmit}>
            <Form.Group controlId="formChequeId">
              <Form.Label>Cheque ID</Form.Label>
              <Form.Control
                type="text"
                name="chequeId"
                value={chequeId}
                onChange={(e) => setChequeId(e.target.value.trim())}
                placeholder="Enter cheque ID"
              />
            </Form.Group>

            <br />  {/* First line break */}
            <br />  {/* Second line break */}
            <Button variant="warning" onClick={handleApprove}>
              Approval of NFT
            </Button>
            <br />  {/* Third line break */}
            <br />

            <Button variant="success" type="submit">
              Submit Cheque
            </Button>
          </Form>
        </>
      )}


    </>
  );
}

export default App;
