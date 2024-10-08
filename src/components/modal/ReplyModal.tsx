import styled from "styled-components"

import { useState } from "react"
import { auth, db, storage } from "../../routes/firebase"
import { addDoc, collection, updateDoc } from "firebase/firestore"
import { getDownloadURL, ref, uploadBytes } from "firebase/storage"
import {Form, TextArea, TextInputLabel, TextInput,InputItem ,SubmitBtn,FileCondition} from "../styled-components/replyModal-styled-components"

const Wrapper =styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color:  rgba(255, 255, 255, 0.2); /* 배경 투명도 조절 */
    display: flex;
    justify-content: center;
    align-items: start;
    z-index: 100;
    padding-top:50px;
`
const Wrapper2= styled.div`
    background-color: black;
    padding: 10px 20px;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    max-width: 500px;
    width: 100%;
    z-index: 101;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`
const Outter= styled.div`
   width: 100%;

   button{
    width: 30px;
    height: 30px;
        background-color: transparent;
        color: white;
        border: none;
        font-size: 20px;
        border-radius: 20px;
        cursor: pointer;
        &:hover{
            background-color:  #242D34;
        }
   }
`
const Inner1= styled.div`
    width: 100%;
    display: flex;
    justify-content: start;
    gap: 20px;
    margin-top:40px;
`
const Avatar =styled.div`
    width: 40px;
    height: 40px;
    border-radius: 50%;
`
const AvatarImg= styled.img`
    width: 40px;
    height: 40px;
    border-radius: 50%;
`
const Poster =styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 20px;
`
const PosterInfo =styled.div`
      display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;

`
const PosterText= styled.div``
const UserName= styled.span``
const UploadedDate= styled.span``

const Payload= styled.span``


const Inner2= styled.div`
    display: flex;
    gap:20px;

    width: 100%;
   margin-top: 30px;
`

export default function ReplyModal(props:{tweetDocId:string, onClose: () => void, profileImg :string|undefined|null, userName:string, updatedDate:string, tweet:string}){

    
    const user= auth.currentUser;
    const  UserImg= user?.photoURL;

    const [reply,setReply]= useState<{
        isLoading: boolean,
        tweet: string,
        file: File | null,
    }>
    ({
            isLoading: false,
            tweet: '',
            file: null,
        })
        function handleChange(e:React.ChangeEvent<HTMLTextAreaElement>){
            setReply(prev=>{
                return{
                    ...prev,
                    tweet: e.target.value,
                }
            })
        }
        function handleFileChange(e:React.ChangeEvent<HTMLInputElement>){
            const {files} = e.target;
            if(files && files.length===1){
                setReply(prev=>{
                    return {
                        ...prev,
                        file: files[0],
                    }
                })
            }
        }
        async function handleSubmit(e:React.FormEvent<HTMLFormElement>){
            e.preventDefault();
            const user= auth.currentUser;
            
            
            if(!user|| reply.isLoading  || reply.tweet.length>100  || reply.tweet.trim()==='')return;
           
            try{
                setReply(prev=>{
                    return{
                        ...prev,
                        isLoading:true,
                    }
                })
                if(confirm('you really reply?')){
                    const doc= await addDoc(collection(db,'comments'),{
                        tweet: reply.tweet,
                        createdAt:  Date.now(),
                        userName :  user.displayName || 'Anonymous',
                        userId :user.uid,
                        profileImg: user.photoURL,
                        like: [],
                        tweetDocId :props.tweetDocId,
                        parentCommentId:  null, 
                        bookmark:[],
                    })

                    if(reply.file){
                        const locationRef= ref(storage,`comments/${user.uid}/${doc.id}`);
                       const uploadResult= await uploadBytes(locationRef,reply.file);
                      const url= await getDownloadURL(uploadResult.ref);
                      await updateDoc(
                        doc,{photo:url});
                    }
                    props.onClose();
                }
    
            }catch(error){
                console.log(error);
            }
            finally{
                setReply(prev=>{
                    return{
                        ...prev,
                        tweet:'',
                        file: null,
                        isLoading:false,
                    }
                })
            }
        }

    return <Wrapper>
            <Wrapper2>
             
                <Outter>
                    <button onClick={()=>props.onClose()}>X</button>
                </Outter>

                <Inner1>
                    <Avatar> 
                                {props.profileImg
                                ? <AvatarImg src={props.profileImg}/>
                                :(
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                                    </svg>
                                ) 
                                }
                     </Avatar>
                     <Poster>
                        <PosterInfo>
                            <UserName>{props.userName}</UserName>
                            <UploadedDate>{props.updatedDate}</UploadedDate>
                        </PosterInfo>
                        <PosterText>
                            <Payload>{props.tweet}</Payload> 
                        </PosterText>
                     </Poster>
                       
                    </Inner1>

                    <Inner2>
                            
                                <Avatar> 
                                            {UserImg
                                                ? <AvatarImg src={UserImg}/>
                                                :(
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                                        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                                                    </svg>
                                                    ) 
                                            }
                                </Avatar>
                                <Form onSubmit={handleSubmit}>
                                        <TextArea placeholder='Post your reply' maxLength={100}  autoFocus onChange={handleChange} value={reply.tweet} required/>

                                        <>
                                                    <FileCondition>
                                                    {reply.file ? "Photo added ✅" : ''}
                                                    </FileCondition>
                                                    {/* 파일 컴포넌트를 가져다쓸때 htmlFor,id는 반드시 다르게 써야함, 같은 이름을 쓸경우 이상한곳으로 사진이 added된다. */}
                                                    <TextInputLabel htmlFor='replyFile'>
                                                        <InputItem>
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                                            <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z"  />
                                                            </svg>
                                                        </InputItem>
                                                    </TextInputLabel>
                                                    <TextInput hidden id='replyFile' type='file' accept='image/*' onChange={handleFileChange}/>
                                                    <SubmitBtn  type='submit' value={reply.isLoading ?"Replying..." :"Reply"}/>
                                         </>

                                 </Form>
                    

                 </Inner2>
                

        </Wrapper2>
    </Wrapper>
}