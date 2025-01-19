import { useState,useEffect,useRef } from 'react'
import * as bootstrap from "bootstrap";
import axios from 'axios';

const api = import.meta.env.VITE_BASE_URL
const path = import.meta.env.VITE_API_PATH


// 登入
const Login = ({user,setUser,getProducts,setIsLogin}) => {
  // 登入 API
  async function handleLogin(e){
    e.preventDefault()      
    try {
      const res = await axios.post(
        `${api}/v2/admin/signin`, user)
      const {token,expired} = res.data
      document.cookie = `token=${token};expires=${new Date(expired)} `;
      axios.defaults.headers.common.Authorization = token
      setIsLogin(true)
      getProducts()
    } catch (error) {
      console.log(error);
      
    }
  }

  // 監聽 input
  function handleInputChange(e){
    const {name,value} = e.target
    setUser({
      ...user,
      [name]:value
    })
  }

  return(
    <>
      <div className='container'>
        <div className='d-flex justify-content-center align-items-center flex-column vh-100'>
          <div className="card p-5 mb-3">
            <h1 className='h3 text-center mb-3'>會員登入</h1>
            <form onSubmit={handleLogin}>
              <div className='form-floating mb-3'>
                <input type="email" id="email" className='form-control' name='username' onChange={handleInputChange} />
                <label htmlFor="email">email</label>
              </div>
              <div className='form-floating mb-3'>
                <input type="password" id="password" className='form-control' name='password' onChange={handleInputChange} />
                <label htmlFor="password">password</label>
              </div>
              <button type='submit' className='btn btn-primary w-100' >登入</button>
            </form>
          </div>
          <div className="text-secondary">@leilei 2025</div>
        </div>
      </div>
    </>
  )
}

// 產品列表
const ProductList = ({products,openEditModal,handleDelete}) => {
  return(
    <>
      <table className='table'>
        <thead >
          <tr>
            <th scope='col'>產品名稱</th>
            <th scope='col'>原價</th>
            <th scope='col'>售價</th>
            <th scope='col'>是否啟用</th>
            <th scope='col'>操作</th>
          </tr>
        </thead>
        <tbody>
          {
            products.map((item,index)=>(
              <tr key={index}>
                <td>{item.title}</td>
                <td>{item.origin_price}</td>
                <td>{item.price}</td>
                <td>{item.isAble}</td>
                <td>
                  <button type='button' className='btn btn-outline-primary me-2' onClick={()=>{openEditModal(item)}}>編輯</button>
                  <button type='button' className='btn btn-outline-danger' onClick={()=>{
                    handleDelete(item.id)
                  }}>刪除</button>
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>

    </>
  )
}

// 產品 Modal Template
const ProductModal= ({addModalRef,addModal,product,setProduct,isEdit, setIsEdit,getProducts}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 新改產品API
  async function handleSubmit(e) {
    e.preventDefault()
    if(isSubmitting) return
    setIsSubmitting(true)

    try {
      const url = isEdit ? `${api}/v2/api/${path}/admin/product/${product.id}` : `${api}/v2/api/${path}/admin/product`
      const method = isEdit ? 'put' : 'post'
      const res = await axios[method](url,{data:product})
      
      alert(isEdit ? '編輯成功':'新增成功')
      getProducts()
      
      setProduct({
        id: "",
        imageUrl: "",
        title: "",
        category: "",
        unit: "",
        origin_price: 0,
        price: 0,
        description: "",
        content: "",
        inAble: false,
        imagesUrl: [''],
      })
    addModal.current.hide()
    setIsEdit(false)
    } catch (error) {
      console.log(error);
    }
  }

  function handleProductChange(e){
    const{name,value}= e.target
    setProduct({
      ...product,
      [name]: name === "origin_price" || name === "price" ? Number(value) : value
    })
    
  }

  // 新增空副圖
  function addImagesUrl(){
    setProduct((pre)=>({
      ...pre,
      imagesUrl: [...pre.imagesUrl,""]
    }))
  }

  // 移除指定位置副圖
  function removeImagesUrl(idx){
    setProduct((pre)=>{
    const upDated = pre.imagesUrl.filter((_,i)=> i !== idx)
    return{
      ...pre,
      imagesUrl: upDated.length > 0 ? upDated : [""]
    }
    })
  }

  function handleImagesUrlChange(idx, val){
    setProduct((pre) => {
      const upDated = [...pre.imagesUrl]
      upDated[idx] = val
      return {...pre,imagesUrl:upDated}
    })
  }

  return(
    <>
      <div className="modal modal-xl fade" ref={addModalRef} tabIndex="-1" aria-labelledby="exampleModalLabel">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="exampleModalLabel">{isEdit? '編輯產品' : '新增產品'}</h1>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="row">
                  <div className="col-5">
                    <div className="row">
                      <div className="col-12 mb-3">
                          <label htmlFor="imageUrl" className='form-label'>主圖</label>
                          <input type="text" id="imageUrl" className='form-control form-control-sm' name='imageUrl' onChange={handleProductChange} value={product.imageUrl || ''} />
                      </div>

                      {product.imagesUrl && Array.isArray(product.imagesUrl) &&  product.imagesUrl.map((img,index)=>(
                        <div key={index} >
                          <div className="col-12 mb-3 card p-3" >
                              <label htmlFor={`imagesUrl${index}`} className='form-label'>副圖{index + 1}</label>
                              <input type="text" id={`imagesUrl${index}`} className='form-control form-control-sm' name={`imagesUrl${index}`} value={img} onChange={(e)=>handleImagesUrlChange(index,e.target.value)}/>
                            <div className='d-flex justify-content-end mt-2'>
                              <button type='button' className='btn btn btn-outline-primary me-2' onClick={addImagesUrl}>新增</button>
                              <button type='button' className='btn btn-outline-danger' onClick={()=>removeImagesUrl(index)}>刪除</button>
                            </div>
                        </div>
                        </div>
                      ))}
                    
                    </div>
                  </div>

                  <div className="col-7">
                    <div className="row">

                      <div className="col-12 mb-3">
                          <label htmlFor="title" className='form-label'>標題</label>
                          <input type="text" id="title" className='form-control form-control-sm' name='title' onChange={handleProductChange} value={product.title || ''} />
                      </div>

                      <div className="col-12 mb-3">
                          <label htmlFor="category" className='form-label'>分類</label>
                          <input type="text" id="category" className='form-control form-control-sm' name='category'onChange={handleProductChange} value={product.category || ''} />
                      </div>

                      <div className="col-12 mb-3">
                          <label htmlFor="unit" className='form-label'>單位</label>
                          <input type="text" id="unit" className='form-control form-control-sm' name='unit'onChange={handleProductChange} value={product.unit || ''} />
                      </div>


                      <div className="col-6 mb-3">
                          <label htmlFor="origin_price" className='form-label'>原價</label>
                          <input type="number" id="origin_price" className='form-control form-control-sm' name='origin_price'onChange={handleProductChange} value={product.origin_price || ''} />
                      </div>

                      <div className="col-6 mb-3">
                          <label htmlFor="price" className='form-label'>售價</label>
                          <input type="number" id="price" className='form-control form-control-sm' name='price'onChange={handleProductChange} value={product.price || ''}/>
                      </div>


                      <div className="col-12 mb-3">
                          <label htmlFor="description" className='form-label'>產品描述</label>
                          <textarea type="text" id="description" className='form-control form-control-sm' name='description' onChange={handleProductChange} value={product.description || ''} />
                      </div>
                      
                      <div className="col-12 mb-3">
                          <label htmlFor="content" className='form-label'>說明內容</label>
                          <textarea type="text" id="content" className='form-control form-control-sm' name='content'onChange={handleProductChange} value={product.content || ''} />
                      </div>

                      <div className="col-12 mb-3">
                        <div className="form-check">
                          <input className="form-check-input" type="checkbox" value="" id="isAble" name='isAble'onChange={handleProductChange}/>
                          <label className="form-check-label" htmlFor="isAble" value={product.isAble || ''}>是否啟用</label>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary " data-bs-dismiss="modal">取消</button>
                <button type="submit" className="btn btn-primary">確認</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

function App() {
  const [user, setUser] = useState({
    username:'',
    password:''
  })
  const [product,setProduct] = useState({
    id: "",
    imageUrl: "",
    title: "",
    category: "",
    unit: "",
    origin_price: 0,
    price: 0,
    description: "",
    content: "",
    inAble: false,
    imagesUrl: [''],
  })
  const [isLogin, setIsLogin] = useState(false)
  const [products,setProducts] = useState([])   // 產品列表
  const [isEdit, setIsEdit] = useState(false)   // 是否編輯
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false)
  
  const addModalRef = useRef(null)
  const addModal = useRef(null)


  useEffect(()=>{
    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/,
      "$1"
    );

    if (token) {
      axios.defaults.headers.common.Authorization = token;
    } else {
      console.log("Token not found");
    }

    checkLogin()
  },[])


    async function checkLogin(){
    try {
      await axios.post(`${api}/v2/api/user/check`)
      getProducts()
      setIsLogin(true)
    } catch (error) {
      console.log(error);
      
    }
  }

  const openAddModal = () =>{
    setIsEdit(false)
    setProduct({
      id: "",
      imageUrl: "",
      title: "",
      category: "",
      unit: "",
      origin_price: 0,
      price: 0,
      description: "",
      content: "",
      inAble: false,
      imagesUrl: [''],
    })
    addModal.current = new bootstrap.Modal(addModalRef.current)
    addModal.current.show()
  }

  const openEditModal = (productData) =>{
    setIsEdit(true)
    setProduct({
      id: productData.id|| "",
      imageUrl: productData.imageUrl || "",
      title: productData.title || "",
      category: productData.category || "",
      unit: productData.unit || "",
      origin_price:productData.origin_price ||  0,
      price:productData.price||  0,
      description:productData.description ||  "",
      content:productData.content || "",
      inAble:productData.inAble || false ,
      imagesUrl: productData.imagesUrl || [''],
    })
    addModal.current = new bootstrap.Modal(addModalRef.current)
    addModal.current.show()
  }

  async function getProducts() {
    try {
      const res =  await axios.get(`${api}/v2/api/${path}/admin/products`)
      setProducts(res.data.products)        
    } catch (error) {
      console.log(error);
    }
  }
  
  async function handleDelete (id){
    if(isSubmittingDelete) return
    setIsSubmittingDelete(true)
    try {
      const res = await axios.delete(`${api}/v2/api/${path}/admin/product/${id}`)
      getProducts()
      alert('成功刪除')
    } catch (error) {
      console.log(error);
      
    }
  }


  return (
    <>
    {
      !isLogin 
      ?
      <Login user={user} setUser={setUser} getProducts={getProducts} isLogin={isLogin} setIsLogin={setIsLogin}></Login>
      :
      <div className="container mt-3">
        <div className='d-flex justify-content-between mb-3'>
          <h1 className='h3'>產品列表</h1>
          <button type='button' className='btn btn-primary' onClick={openAddModal}>新增產品</button>
          <ProductModal addModalRef={addModalRef} addModal={addModal} product={product} setProduct={setProduct} products={products} setProducts={setProducts}  isEdit={isEdit} setIsEdit={setIsEdit} getProducts={getProducts}> </ProductModal>
        </div>
        <ProductList products={products} setProducts={setProducts} openEditModal={openEditModal} handleDelete={handleDelete} setProduct={setProduct}></ProductList>
      </div>
    }
    
    </>
  )
}

export default App
