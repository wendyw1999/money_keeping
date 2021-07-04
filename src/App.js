import React, { Component, useState, useEffect } from 'react'
import { SketchPicker } from 'react-color'
import { Input, Button } from 'antd'
import { DataStore } from '@aws-amplify/datastore'
import { Item } from './models'

const initialState = { color: '#000000', title:'', amount:'',category:'in'}

function App () {
  const [formState, updateFormState] = useState(initialState)
  const [items, updateItems] = useState([])
  const [showPicker, updateShowPicker] = useState(false)

  function toNumber(string) {
    if (string == 'in') {
      return 1
    } else if (string == 'out') {
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
      if (e.target.value == 'out') {
        updateFormState({...formState,category:'out'})
      }
    }
    function onChange(e) {
      if (e.hex) {
        updateFormState({...formState,color:e.hex})
      }
      else if (e.target.name == 'amount') {
          if (isNaN(e.target.value)) {
            console.log(e.target.value)

          } else {
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
    }
    return (
      <div style={container}>
        <h1 style = {heading}>
          Money Keeping Book
        </h1>
        <label htmlFor="in_out"></label>
<select style = {dropDown} name="in_out" id="dropdown" value = {formState.category} onChange = {onChangeInOut}>
  <option value="in">Money In +</option>
  <option value="out">Money Out -</option>
</select>
        
        <Input onChange = {onChange} name = 'amount' placehodler = 'Amount' value = {formState.amount}
        style = {input}>
        </Input>
        <Input onChange = {onChange} name = 'title' placehodler = 'Title' value = {formState.title}
        style = {input}>
        </Input>
        <div>
        <Button onClick = {() => updateShowPicker(!showPicker)}style={button}>
        Toggle Color Picker
      </Button>
      <p>Color: <span style={{fontWeight:'bold', color:formState.color}}>{formState.color}</span></p>
        </div>
        {
      showPicker && <SketchPicker color={formState.color} onChange={onChange}/>

    }
    <Button type='primary' onClick={createItem}>Create Item</Button>
    <p>Running Total: ￥{items.reduce((a,v) =>  a = a + toNumber(v.category)*v.amount , 0 )}</p>
    {

      
      items.map(item => (
        <div key ={item.id} style = {{...itemStyle,backgroundColor:item.color}}>
          <div style={itemBg}>
          <p style={itemAmount}>￥{toNumber(item.category)*item.amount},{item.title}</p>
          <p>{item.createdAt}</p>
          <form onSubmit = {(e) => {console.log("Do Something"); e.preventDefault();}}>
          <Button type = 'danger' style = {button} onClick = {(e) => {
            deleteItem(item)
          }}>
            Delete Item
          </Button>
          </form>
          
          </div>
        </div>
      ))
    }


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