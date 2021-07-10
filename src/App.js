import React, { Component, useState, useEffect, useRef} from 'react'
import { SketchPicker } from 'react-color'
import { Input } from 'antd'
import { DataStore } from '@aws-amplify/datastore'
import { Item } from './models'
import Button from 'react-bootstrap/Button';
import { InputGroup,FormControl,Dropdown,DropdownButton,Card, Row,Col, Container,
Tab,Tabs,Toast,Popover,OverlayTrigger,Overlay,Tooltip,Modal } from 'react-bootstrap';

const initialState = { color: '#000000', title:'', amount:'',category:'-'}

function App () {
  const [formState, updateFormState] = useState(initialState)
  const [items, updateItems] = useState([])
  const [showPicker, updateShowPicker] = useState(false)
  const [key, setKey] = useState('write');
  const[showTooltip,setShowTooltip] = useState(false);
  const[showModal,setShowModal] = useState(false);

  const target = useRef(null);
  var currItem = '';

  
function colorPickerButton() {
  if (showPicker) {
    return <i>隐藏颜色选择器</i>;
  } else {return  <i>显示颜色选择器</i>}
}
  function handleCloseModal() {
    setShowModal(false);
  }
  function handleShowModal() {
    setShowModal(true);
  }



  function toNumber(string) {
    if (string == '+') {
      return 1
    } else if (string == '-') {
      return -1
    } else {
      return 0
    }
  }
  useEffect(() => {
    fetchItems()
    const subscription = DataStore.observe(Item).subscribe(() => fetchItems())
    return ()=> subscription.unsubscribe()
    })

    function onChangeInOut(e) {
      if (e.target.getAttribute('value') == '-') {
        updateFormState({...formState,category:'-'})
      } else {
        updateFormState({...formState,category:'+'})
      }
    }
    function onChange(e) {
      if (e.hex) {
        updateFormState({...formState,color:e.hex})
      }
      else if (e.target.name == 'amount') {
          if (isNaN(e.target.value)) {
            setShowTooltip(true);

          } else {
            setShowTooltip(false);
            const toNumeric = Number(e.target.value);
            
          updateFormState({...formState,amount:toNumeric})
          }

          
        
      }
      else {
        updateFormState({...formState, title:e.target.value})
      }
    }
    async function fetchItems() {
      const items = await DataStore.query(Item)
      updateItems(items)
    }
    
    async function createItem() {
      if (!formState.title || !formState.amount) return //if title is empty return nothing
      
      await DataStore.save(new Item({...formState})) 
      updateFormState(initialState)
    }
    async function deleteItem(item) {
      const todelete = await DataStore.query(Item,item.id);
      DataStore.delete(todelete);
      setShowModal(false);
    }
    function processDate(dateString) {
      var d = new Date(dateString);

      const dateToReturn  = d.getHours() + ":" + d.getMinutes() + ", " + d.toDateString();

      return dateToReturn
    }

   function processToastHeader(item) {
      const dateString = processDate(item.createdAt)
      return <Toast.Header style = {{...itemStyle,color:item.color}}>
            <img src="holder.js/20x20?text=%20" className="rounded mr-2" alt="" />
            <strong className="mr-auto">{item.title}</strong>
            <small>{dateString}</small>
          </Toast.Header>

    }
    function handleModal(item) {

      
      return <Modal
      show={showModal}
      onHide={()=>handleCloseModal()}
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>删除提醒:{item.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        确定删除该条记录？
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={()=>handleCloseModal()}>
          取消
        </Button>
        <Button variant="danger" onClick = {() => deleteItem(item)}>确定删除</Button>
      </Modal.Footer>
    </Modal>
    }
    return (
      <div style={container}>
        <h1 style = {heading}>
          记账本
        </h1>
        <Tabs
      id="controlled-tab-example"
      activeKey={key}
      onSelect={(k) => setKey(k)}
    >
      <Tab eventKey="write" title="记账">
      
      
        <br></br>
      <InputGroup className="mb-3">
<DropdownButton
      as={InputGroup.Prepend}
      variant="outline-secondary"
      id="input-group-dropdown-1"
      title = {formState.category}
    >
      <Dropdown.Item href="#" value = '-' onClick = {onChangeInOut}>支出</Dropdown.Item>
      <Dropdown.Item href="#" value = '+' onClick = {onChangeInOut}>收入</Dropdown.Item>

    </DropdownButton>
    <InputGroup.Prepend>
      <InputGroup.Text>￥</InputGroup.Text>
    </InputGroup.Prepend>
    <FormControl  pattern="[0-9]*" ref={target}
    onChange = {onChange} id = 'amount' name = 'amount' placehodler = 'Amount' value = {formState.amount} 
    aria-label="Amount (to the nearest dollar)" />
    <Overlay target={target.current} show={showTooltip} placement="top">
        {(props) => (
          <Tooltip id="overlay-example" {...props}>
            Please Enter Numbers
          </Tooltip>
        )}
      </Overlay>
  </InputGroup>
  <InputGroup className="mb-3">
    <InputGroup.Prepend>
      <InputGroup.Text id="basic-addon3">
        描述
      </InputGroup.Text>
    </InputGroup.Prepend>
    <FormControl 
    onChange = {onChange} name = 'title' placehodler = 'Title' value = {formState.title} 
    id="description" aria-describedby="basic-addon3" />
  </InputGroup>

        <div>
        <Button variant="outline-secondary" onClick = {() => updateShowPicker(!showPicker)}>
        {colorPickerButton()}
      </Button>
      <p>颜色: <span style={{fontWeight:'bold', color:formState.color}}>{formState.color}</span></p>
        </div>
        {
      showPicker && <SketchPicker color={formState.color} onChange={onChange}/>

    }
    <Button variant='primary' onClick={createItem}>记账</Button>
    <p>当前结余 ￥{items.reduce((a,v) =>  a = a + toNumber(v.category)*v.amount , 0 )}</p>
      </Tab>
      <Tab eventKey="history" title="历史记录">
      <br></br>

      {

      
        items.map(item => (
          

          <Toast key = {item.id} onClose ={()=>handleShowModal()}>
            {handleModal(item)}
          {processToastHeader(item)}
          <Toast.Body>￥{toNumber(item.category)*item.amount}</Toast.Body>
          </Toast>
          
        ))
        }
      </Tab>
      <Tab eventKey="stats" title="统计">
        <Container>
          <Row>
          
            <Col>收入</Col>
            <Col>支出</Col>
            <Col>结余</Col>
          </Row>
        </Container>
      </Tab>
    </Tabs>
    
        
        

    </div>
      )
}
const dropDown = {marginBottom: 10,color:'black'}
const container = {width: '100%', padding: 40, maxWidth: 900}
const input = {marginBottom: 10,color:'black'}
const button = {marginBottom: 10}
const heading = {fontWeight: 'normal', fontSize:40}
const itemBg = {backgroundColor:'white'}
const itemStyle = {padding: '10px',marginTop: 7, borderRadius:2}
const itemTitle = {
  margin: 0,adding:9,fontSize:20
}
const itemAmount = {
  margin: 0,adding:9,fontSize:20
}
export default App