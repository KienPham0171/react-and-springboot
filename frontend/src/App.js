
import './App.css';
import React,{useState,useEffect,useReducer} from 'react';
import axios from "axios";
import {Routes,Route, Link,useLocation} from "react-router-dom"

function App() {

  const domain = "http://localhost:8080";

  const dataReducer = (state, action) => {
    switch(action.type){
      case "get_data_from_api":{
        return getDataFromApi(state,action);
      }
      case "set_data":{
        return setData(state,action);
      }
      case "delete":
        return removeItem(state, action)
      case "delete_from_cart_by_user":
        return removeFromCartByUser(state, action);
      case "get_data_failure":
        return getDataFailure(state, action);
      case "set_cartItems":
        return setCartItems(state,action);
      case "admin_update_item":
        return updateItemByAdmin(state,action);
      case "create_item":
        return createItemByAdmin(state,action);
      default: return;
    }
    
  }

  const [addEr,setAddEr] = useState(false);
  const createItemByAdmin = (state, action) =>{
    const item = action.payload.item;
    let turl = domain + "/api/v1/data/products";
    axios({
      method: "post",
      url: turl,
      data: item
    }).then(response =>{
      if(response.status === 200){
        const books = response.data;
        setAddEr(false);
        dispatcherAction({
          type: "set_data",
          payload: books,
        })
      }
      if(response.status === 202){
        setAddEr(true)
      }
    })
    .catch(err =>console.log(err));
    return {
      ...state
    }

  }
  const updateItemByAdmin =(state, action)=>{
    const item = action.payload.item;
    let turl = domain + "/api/v1/data/products";

    axios({
      method: "put",
      url: turl,
      data: item
    }).then(response =>{
      if(response.status === 200){
        const books = response.data;
  
        dispatcherAction({
          type: "set_data",
          payload: books,
        })
      }
    })
    .catch(err =>console.log(err));
    return {
      ...state
    }
  }
  const setCartItems = (state, action) =>{
    return {
      ...state,
      loading: false,
      cartItems: action.payload,
    }
  }
  const getDataFromApi = (state,action) =>{
    return {
      ...state,
      isLoading: true
    }
  }
  function setData(state,action){
    return {
      ...state,
      books: action.payload,
      isLoading: false
    }
  }
  
  
  function removeItem(state, action){
    var id = action.payload.id;
    var turl = `${domain}/api/v1/data/products/${id}`;
    axios({
       method: "delete",
       url: turl,
     })
          .then(response =>{
            if(response.status === 200){
              const rest = response.data.filter( book => book.id !== id);
              console.log(rest)
              dispatcherAction({
                type: "set_data",
                payload: rest,
              })
            }
          })
          .catch(err =>{
            console.log(err);
            let result =  {...state}
          });
    return {...state};
  }
  const removeFromCartByUser = (state,action) =>{
    var id = action.payload.id;
    var turl = `${domain}/api/v1/data/cartItems/${id}`;
    var ax = axios({
       method: "delete",
       url: turl,
     })
          .then(response =>{
            if(response.status === 200){
              var cartItems = response.data;
              dispatcherAction({
                type:"set_cartItems",
                payload: cartItems
              })
            }
          })
          .catch(err =>{
            console.log(err);
            
          });
    return {...state};
  }
  const getDataFailure = (state, action) =>{
    console.log(state)
    return {
      ...state,
      isError: true
    }
  }

  const initialData = {
    books: [],
    cartItems: [],
    isLoading: false,
    isError: false,
  }
  const [data,dispatcherAction] = useReducer(dataReducer,initialData)
  const [searchTerm,setSearchTerm] = useState(" ");

  //initial
  useEffect(()=>{
    dispatcherAction({
      type: "get_data_from_api"
    })
    
    axios.get(`${domain}/api/v1/data/products`)
    .then(data =>{
      dispatcherAction({
        type: "set_data",
        payload: data.data,
      })
    })
    .catch(err =>{
      dispatcherAction({
        type: "get_data_failure"
      })
    })
    var turl = domain +"/api/v1/data/cartItems"
    axios.get(turl).then(response =>{
      dispatcherAction({
        type: "set_cartItems",
        payload: response.data
      })
    }).catch(err =>{
      dispatcherAction({
        type: "get_data_failure"
      })
    })
  },[])

  //features
  const handlerChange = (event) =>{
    setSearchTerm(event.target.value);
  }
  let handlerDelete = id => {
    dispatcherAction({
      type:"delete_from_cart_by_user",
      payload: {
        id
      },
    })
  }
  

  const addToCart = (item) => {
    var turl = `${domain}/api/v1/data/cartItems`;
    axios({
      method: 'POST',
      data: item,
      url: turl,
    }).then(response => {
      if(response.status ==200){
        dispatcherAction({
          type: "set_cartItems",
          payload: response.data
        })
      }
    })
    .catch(err => dispatcherAction({
        type: "get_data_failure"
      }))
  }
  const delHandler = (id) => {
    dispatcherAction({
      type: "delete",
      payload: { 
        id
      }
    })
  }

  //searchFilter
  const finalData = data.books.filter( item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));


  return (
    <div className="App  mx-auto  border-gray-300 border rounded-md min-h-screen">
      <h3 className="font-bold text-2xl py-8">Hello and welcome to my app!</h3>
      
      <h4 className= "font-bold mt-3">Users</h4>
      <Search onChange = {handlerChange}/>
      
      {data.isLoading ? <p>Loading data...</p>: <List data = {finalData} onDelete = {handlerDelete} addToCart={addToCart}/>}
      
      <h4 className= "font-bold">Cart</h4>
      <Cart listCartItems={data.cartItems} handlerDeleteFromCart={handlerDelete} />
      
      <h4 className= "font-bold">Admin</h4>
      <AdminList addEr={addEr} data = {data.books} delHandler ={delHandler} dispatcherAction={dispatcherAction}/>
      
      
        <Routes>
        <Route path="/" ></Route>
        
        </Routes>
      
    </div>
  );
}

//components
const Search = ({onChange})=>{
  const [term,setTerm] = useState("");
  const handlerChange = (event) =>{
    onChange(event);
    setTerm(event.target.value);
  }
  return (
    <>
      <input placeholder="Search" className="px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring w-64" value={term} type="text" id="search" onChange={handlerChange}/>
    </>
  )
}
const List = ({data,onDelete,addToCart}) =>{
  return (
    <>
      <ol className="grid grid-cols-1 py-5 min-h-300 mt-3 ">
        {data.map(item => <Item key={item.id} item={item} onDelete = {onDelete} addToCart={addToCart}/>)}
      </ol>
    </>
  )
} 
const Item = ({item,onDelete,addToCart}) =>(
    <li className=" mt-1 bg-orange-200 p-3 rounded-md w-1/2 place-self-center text-left pl-10">
      Name:<span className="font-bold"> {item.name} - </span>
      Author:<span className="font-bold"> {item.author} </span>
      
      <button type="button" onClick={()=>addToCart(item)}
      className="bg-violet-700 hover:bg-violet-900 text-white font-bold py-2 px-4 rounded float-right ">
        Add to Cart
      </button>
    </li>
);
const Cart = ({listCartItems,handlerDeleteFromCart}) =>{
  return (
    <>
    <ol className="grid grid-cols-1 py-5 min-h-300 ">
    {listCartItems.map( item => <CartItem key={item.id} {...item} onDelete= {handlerDeleteFromCart}/>)}
    </ol>
    </>
  )
}
const CartItem =({id,name,author,amount,onDelete}) =>{
  return (
    <li className=" mt-1 bg-green-200 p-3 rounded-md w-1/2 place-self-center text-left pl-10">
      Name:<span className="font-bold"> {name} - </span>
      Author:<span className="font-bold">  {author} - </span>
      Amount:<span className="font-bold">  {amount} </span>
      <button type="button" onClick={()=>onDelete(id)} 
      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-5 float-right">
        Remove
      </button>
    </li>
  )
}

//admin
const AdminList = ({addEr,data,delHandler,dispatcherAction})=>{
  return (
    <>
     
    <ol className="grid grid-cols-1 py-5 min-h-300 ">
        <div className="mt-1  p-3 rounded-md  place-self-center">
          <Link to="/add"
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-5 mb-5">
              
          New Item</Link>
            
          <div className="mt-5">
            <Routes>
              <Route path="/add" element={<AddItem addEr={addEr} dispatcherAction={dispatcherAction} />}></Route>
            </Routes>
          </div>
        </div>
      {data.map(item => <AdminItem key={item.id} item={item} delHandler={delHandler} dispatcherAction={dispatcherAction} />)}
    </ol>
    </>
  )
}
const AdminItem = ({item,delHandler,dispatcherAction}) =>{
  return (
    <li className=" mt-1 bg-purple-200 p-3 rounded-md w-1/2 place-self-center text-left pl-10">
      Name:<span className="font-bold"> {item.name} - </span>
      Author:<span className="font-bold">  {item.author} </span>
      
      
       
      <button type="button" onClick={()=>delHandler(item.id)} 
      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-5 float-right">
        Delete
      </button>
      <Link to={`/update/${item.id}`} state={{item}} >
        <button type="button" className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded ml-5 float-right">
        Update</button>
        
        </Link>
      <div className="mt-10 ">
      <Routes>
        <Route path={`/update/${item.id}`} element={<UpdateItem dispatcherAction={dispatcherAction}/>}></Route>
      </Routes>
      </div>
    </li>
    
  )
}
const UpdateItem = ({dispatcherAction}) => {
  const {state} = useLocation();
  const {item} = state;
  const submitHandler = (event) =>{
    event.preventDefault();
    var newItem = {
      ...item,
      name: event.target.name.value,
      author: event.target.author.value
    }
    updateItem(newItem);
    
  }
  const updateItem = (item) =>{
    dispatcherAction({
      type: "admin_update_item",
      payload:{
        item
      }
    })
  }
    return (
      <form className="w-full max-w-sm" onSubmit={submitHandler}>
      <div className="md:flex md:items-center mb-6">
        <div className="md:w-1/3">
          <label className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4" htmlFor="inline-full-name">
            Name
          </label>
        </div>
        <div className="md:w-2/3">
          <input className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500" id="inline-full-name" type="text"
          defaultValue={item.name} name="name" />
        </div>
      </div>
      <div className="md:flex md:items-center mb-6">
        <div className="md:w-1/3">
          <label className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4" htmlFor="inline-password">
            Author
          </label>
        </div>
        <div className="md:w-2/3">
          <input className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500" id="inline-password" type="text" 
           defaultValue={item.author} name="author"/>
        </div>
      </div>
      <div className="md:flex md:items-center">
        <div className="md:w-1/3" />
        <div className="md:w-2/3">
          <button className="shadow bg-purple-500 hover:bg-purple-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded" type="submit">
            Update
          </button>
          <Link className="ml-5" to="/" >
          <button className="shadow bg-purple-500 hover:bg-purple-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded ">
            Close
          </button>
          </Link>
          
        </div>
      </div>
      </form>
    )
}
const AddItem = ({addEr,dispatcherAction}) => {
  

  const submitHandler = (event) =>{
    event.preventDefault();
    var item ={
      id: 0,
      name: event.target.name.value,
      author: event.target.author.value
    }
    dispatcherAction({
      type: "create_item",
      payload: {
        item
      }
    })
  }
  return (
    <div>
      
      {addEr ? <p className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-5 mb-5" >Item has existed !</p>:<span></span>}
    
    
    <form className="w-full max-w-sm" onSubmit={submitHandler}>
    <div className="md:flex md:items-center mb-6">
      <div className="md:w-1/3">
        <label className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4" htmlFor="inline-full-name">
          Name
        </label>
      </div>
      <div className="md:w-2/3">
        <input className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500" id="inline-full-name" type="text"
        defaultValue="Spring in action" name="name" />
      </div>
    </div>
    <div className="md:flex md:items-center mb-6">
      <div className="md:w-1/3">
        <label className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4" htmlFor="inline-password">
          Author
        </label>
      </div>
      <div className="md:w-2/3">
        <input className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500" id="inline-password" type="text" 
         defaultValue="Kein Pham" name="author"/>
      </div>
    </div>
    <div className="md:flex md:items-center">
      <div className="md:w-1/3" />
      <div className="md:w-2/3">
      
        <button className="shadow bg-purple-500 hover:bg-purple-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded" type="submit">
          Add
        </button>
        
          <Link className="ml-2" to="/">
          <button className="shadow bg-purple-500 hover:bg-purple-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded" >
          Cancel
        </button>
          </Link>
        
        
        
      </div>
    </div>
    </form>
    </div>
  )
}



export default App;
