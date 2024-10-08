  
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './routes/Home'
import Layout from './components/Layout'
import Login from './routes/Login'
import Signup from './routes/Signup'
import  { createGlobalStyle,styled} from 'styled-components'
import reset from 'styled-reset';
import { useEffect, useState } from 'react'
import LoadingScreen from './components/LoadingScreen'
import { auth } from './routes/firebase'
import ProtectedRoute from './components/ProtectedRoute'
import ResetPassword from './components/resetPassword'
import Begin from './routes/Begin'
import Profile from './routes/Profile'
import TweetPage from './components/tweetPage'
import RetweetPage from './components/retweetPage'
import Bookmark from './routes/Bookmark'


const GlobalStyles = createGlobalStyle` 
  ${reset}
  body{
    background-color: black;
    color: white;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
`
const Wrapper = styled.div`
    height: 100%;

`

const router =createBrowserRouter([{
  path:'/',
  element :
  <ProtectedRoute>
        <Layout/>
  </ProtectedRoute> ,
  children:[  
      {
        path:"/",
        element:<Home/>,
      },
      {
        path:"profile",
        element:<Profile/>,
      },
      {
        path:"bookmark",
        element:<Bookmark/>,
      },
      {
        path:`tweet/:tweetDocId`,
        element:<TweetPage/>,
      },
      {
        path:`retweet/:retweetDocId`,
        element:<RetweetPage/>,
      }
  ]
},
{
  path:'/login',
  element : <Login/>,
},
{
  path:'/signup',
  element:<Signup/>,
},
{
  path:'/resetpassword',
  element:<ResetPassword/>,
},
{
  path:'/begin',
  element:<Begin/>,
}
])


function App() {
  const [isLoading,setIsLoading]=useState(true);

  async function init() {
    await auth.authStateReady();
    setIsLoading(false);  
  }
  
  useEffect(()=>{init()},[]);

  return (
   <Wrapper>
    <GlobalStyles/>
    {isLoading ? <LoadingScreen/> :<RouterProvider router={router}/>}
   </Wrapper>
  )
}

export default App
