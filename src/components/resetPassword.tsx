
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FirebaseError } from 'firebase/app'
import { sendPasswordResetEmail } from 'firebase/auth'
import { Title,Wrapper,Form, Input,Switcher,Error} from './styled-components/auth-styled-components'
import { auth } from '../routes/firebase'


export default function ResetPassword(){
    const [email,setEmail]= useState('');
    const [isLoading,setIsLoading]= useState(false);
    const [error,setError]= useState('');
    const navigate= useNavigate();


    async function handleSubmit(e: React.FormEvent<HTMLFormElement>){
        e.preventDefault();
        if(isLoading  || email==='') return;
        setError('');   

        try{
             setIsLoading(true);
            await sendPasswordResetEmail(auth,email);
            alert('Check your email!');
            navigate('/login');

        }
        catch(e){
            if(e instanceof FirebaseError){
                setError(e.code);
            }
        }
        finally{
            setEmail('');
            setIsLoading(false);
        }

    }
    function handleChangeInput(e:React.ChangeEvent<HTMLInputElement>){
        //  코드 이해 잘 안감? 타입 지정? 
        const  {target:{name,value}} = e;

         if(name==='email'){
            setEmail(value);
        }
    }
    return (
        <Wrapper>
            <Title>Please write your Email!</Title>
            <Form onSubmit={handleSubmit}>
                <Input name="email" placeholder='email' type='email' required value={email} onChange={handleChangeInput}/> 
                <Input name="button" type='submit' value={isLoading ? 'Loading...' : 'Send'}/>
            </Form>
            {error!=='' && <Error>{error}</Error> }
            <Switcher>
            <Link to="/begin">돌아가기</Link>
            </Switcher>
        </Wrapper>
    )
}
