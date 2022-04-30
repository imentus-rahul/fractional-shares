import { Fragment, useRef, useState } from "react";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { BN } from "bn.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { useLocation } from "react-router-dom";
import { Col, Form, Row, Button, Image, Alert } from "react-bootstrap";
import {
  getExternalPriceTransaction,
  createVaultTransactions,
  getNFTSAddToVaultInstructions,
} from "./utils/create_vault";
import {sendTransactions} from './utils/transactions_helper';

function FractionalizeNft() {
  /*
      tokenMint is the publicKey of the NFT
      tokenAccount is the publicKey of the tokenAccount that owns the NFT
  */
  const params = useLocation();
  const numRef = useRef();

  const [vaultId, setVaultId] = useState("");
  const [step,setStep] = useState(0);
  const [messages, setMessages] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

    const { publicKey, wallet, sendTransaction, signTransaction } = useWallet();

    const connection = new Connection(clusterApiUrl("devnet"));
  
    const myNfts = [
    {
      tokenAccount: new PublicKey(params.state.tokenAccount),
      tokenMint: new PublicKey(params.state.mint),
      amount: new BN(1),
    }
  ];

const createFractionalVault = async (event) => {
  event.preventDefault();
    const walletAdapter = wallet.adapter;

  let {
    externalPriceAccount,
    priceMint,
    signers: epaSigners,
    instructions: epaInstructions,
  } = await getExternalPriceTransaction(connection, walletAdapter);

  let {
    vault,
    fractionMint,
    redeemTreasury,
    fractionTreasury,
    instructions: createVaultInstructions,
    signers: createVaultSigners,
  } = await createVaultTransactions(connection, externalPriceAccount, wallet.adapter);


  let { instructions: addToVaultInstructions, signers: addToVaultSigners } =
    await getNFTSAddToVaultInstructions({
      connection,
      vault,
      wallet: walletAdapter,
      listOfNFTs: myNfts
    });


  let instructionSet = [
    epaInstructions,
    createVaultInstructions,
    addToVaultInstructions,
  ];
  let signersSet = [epaSigners, createVaultSigners, addToVaultSigners];

  const result = await sendTransactions({
    connection,
    wallet: wallet.adapter,
    instructionSet,
    signersSet
  });

  if(result){
    console.log(vault.toBase58());
  }
  setVaultId(vault.toBase58());
};




  return (
    <Fragment>
      <Row style={{ padding: "20px" }}>
        <Col xs="12" md="12" lg="6">
          <Row className="justify-content-center">
            <Col xs="12" md="12" lg="4">
              <Image fluid rounded src={params.state.image} />
            </Col>
          </Row>
          <Row>
            <br />
          </Row>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Token Mint</Form.Label>
              <Form.Control placeholder={params.state.mint} disabled />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Token Account</Form.Label>
              <Form.Control placeholder={params.state.tokenAccount} disabled />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Number of shares</Form.Label>
              <Form.Control
                ref={numRef}
                type="text"
                placeholder="Enter number of shares to be minted"
              />
              <Form.Text className="text-muted">
                You can't mint more more shares after creating your vault.
              </Form.Text>
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              onClick={createFractionalVault}
              style={{ width: "100%" }}
            >
              FractionalizeNft
            </Button>
            <br/>
            <br />
            <br />
            <br />
            <br />
          </Form>
        </Col>
        <Col xs="12" md="12" lg="6">
          {loading && (
            <center>
              <Image
                src="https://miro.medium.com/max/1400/1*CsJ05WEGfunYMLGfsT2sXA.gif"
                alt="gif"
                width="300px"
              />
            </center>
          )}
          <Row className="justify-content-center" id="results">
            {messages.map((message, index) => (
              <Col xs="12" md="12" lg="12" key={index}>
                <Alert variant="success">{message}</Alert>
              </Col>
            ))}
          </Row>
          <Row className="justify-content-center" id="results">
            {errors.map((message, index) => (
              <Col xs="12" md="12" lg="12" key={index}>
                <Alert variant="success">{message}</Alert>
              </Col>
            ))}
          </Row>
        </Col>
        <br />
        <br />
        <br />
        <br />
        <br />
      </Row>
    </Fragment>
  );
}

export default FractionalizeNft;
