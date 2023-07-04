import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import axiosClient from "../axios-client"
import { useStateContext } from "../contexts/ContextProvider";

export default function UserForm() {
  const {id} = useParams()
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false)
  const [errors, seterrors] = useState(null)
  const {setNotification} = useStateContext()
  const [user, setUser] = useState({
    id: null,
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })

  if (id) {
    useEffect(() => {
      setLoading(true)
      axiosClient.get(`/users/${id}`)
        .then(({data}) => {
          setLoading(false)
          setUser(data)
        })
        .catch(() => {
          setLoading(false)
        })
    }, [])
  }

  const onSubmit = (ev) => {
    ev.preventDefault();
    if (user.id) {
      axiosClient.put(`/users/${user.id}`, user)
        .then(() => {
          // TODO show notification
          setNotification("User updated")
          navigate('/users')
        })
        .catch(err => {
          const response = err;
          console.log('updated',response);
          if (response && response.status === 422) {
            setErrors(response.data.errors);
          }
        })
    } else {
      axiosClient.post(`/users`, user)
        .then(() => {
          // TODO show notification
          setNotification("User created")
          navigate('/users')
        })
        .catch(err => {
          console.log('created', response);
          const response = err.response;
          if (response && response.status === 422) {
            setErrors(response.data.errors);
          }
        })
    }
  }

  return (
    <>
      {id && <h1>Update User: {user.name} </h1>}
      {!id && <h1>New User </h1>}
      <div className="card animated fadeIntDown">
        {loading && (
          <div className="text-center">Loading...</div>
        )}
        {
          errors && <div className="alert">
            {Object.keys(errors).map(key => (
              <p key={key}>{errors[key][0]}</p>
            ))}
          </div>
        }
        {!loading &&
          <form onSubmit={onSubmit}>
            <input onChange={ev => setUser({...user, name: ev.target.value})} value={user.name} placeholder="Name" />
            <input type="email" onChange={ev => setUser({...user, email: ev.target.value})} value={user.email} placeholder="Email" />
            <input type="password" onChange={ev => setUser({...user, password: ev.target.value})} placeholder="Password" />
            <input type="password" onChange={ev => setUser({...user, password_confirmation: ev.target.value})} placeholder="Password Confirmation" />
            <button className="btn">Save</button>
          </form>
        }
      </div>
    </>
  )
}
