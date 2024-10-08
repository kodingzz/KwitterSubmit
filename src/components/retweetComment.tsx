
import { ITweets } from "./timeline";
import { auth, db, storage } from "../routes/firebase";
import { collection, deleteDoc, deleteField, doc, getDocs, orderBy, query, updateDoc, where } from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useEffect, useState } from "react";
import { Wrapper, Column,Row,UserName,UploadedDate,Payload,Photo,Div,DeleteBtn,EditBtn,EditTextArea,EditTextLabel,EditTextInput,CancelBtn,UpdateBtn,InputItem,Wrapper2,DeleteImg, Wrapper3, ReplyContainer, Like, Reply, Bookmark, Share, NonLike, NonBookmark} from "./styled-components/tweet-styled-components";
import { FileCondition } from "./styled-components/post-tweet-styled-components";
import styled from 'styled-components';

import { createPortal } from "react-dom";
import {  useNavigate } from "react-router-dom";
import ReplyModal2 from "./modal/ReplyModal2";

const Avatar =styled.div`
width: 40px;
height: 40px;
border-radius: 50%;
overflow: hidden;

`
const AvatarImg =styled.img`
width: 100%;
height: 100%;
`

const TextAndPhoto =styled.div`
   cursor: pointer; 
`


export default function RetweetComment({userName,tweet,photo,createdAt,userId,docId,profileImg,like,bookmark}:ITweets){
    const user= auth.currentUser;

    const modal = document.getElementById('modal');
    
    const [likeClicked,setLikeClicked]= useState(like.filter(item=>item===user?.uid).length===0 ? false: true);
    const [bookmarkClicked,setBookmarkClicked]= useState(bookmark.filter(item=>item===user?.uid).length===0 ? false: true);
    const [commentsLength,setCommentsLength] = useState(0);

    const [replyClicked,setReplyClicked] =useState(false);
    const updatedDate = new Date(createdAt).toLocaleDateString('en-US', {
            year:'numeric',
            month:'short',
            day: 'numeric',
            hour:'numeric',
        })

    const navigate =useNavigate();
    async function  updateUserInfo() {
        if (user?.uid === userId) {
            const docRef = doc(db, "comments", docId);
            await updateDoc(docRef,{ profileImg: profileImg, userName: user.displayName });
        }
    }
    async function fetchComments(){
        const commentsQuery =query(collection(db ,'comments'), where('parentCommentId', '==', docId), orderBy('createdAt',"desc"));
        const snapshotLength=(await getDocs(commentsQuery)).docs.length;
        setCommentsLength(snapshotLength);
    }
    useEffect(()=>{
        updateUserInfo()
        fetchComments()
    },[]);   
   

    const [edit,setEdit]= useState<{
        isLoading: boolean,
        isEdit: boolean,
        tweet: string,
        file: File | null,
    }>
    ({
            isLoading: false,
            isEdit:false,
            tweet: tweet,
            file: null,
        })
       
        
        function handleChange(e:React.ChangeEvent<HTMLTextAreaElement>){
            setEdit(prev=>{
                return{
                    ...prev,
                    tweet: e.target.value,
                }
            })
        }
        function handleFileEdit(e:React.ChangeEvent<HTMLInputElement>){
            const {files} = e.target;
            
            if(files && files.length===1){
                setEdit(prev=>{
                    return {
                        ...prev,
                        file: files[0],
                    }
                })
            }
        }
    
        async function handleDeleteBtn(){
            try{
                if(confirm('you really delete this retweet?')){
                    await deleteDoc(doc(db,"comments",docId));
                    if(photo){
                        const photoRef =ref(storage,`comments/${userId}/${docId}`);
                        await deleteObject(photoRef);   
                    }
             }
            }
            catch(error){
                console.log(error); 
            }
        }
    
        async function handleEditBtn(){
            setEdit(prev=>{
                return{
                    ...prev,
                    isEdit:true,
                }
            })  
        }
        function handleCancel(){
            setEdit(prev=>{
                return{
                    ...prev,
                    isEdit:false,
                }
            })  
        }
        async function handleUpdate(){
           if(edit.isLoading || edit.tweet.trim()==='' || edit.tweet.length>300) return;

            try{
                if(confirm('you want update?')){
                    setEdit(prev=>{
                        return{
                            ...prev,
                            isLoading:true,
                        }
                    })  
                    await updateDoc(doc(db, 'comments', docId),{tweet: edit.tweet});

                    if(edit.file){
                        const locationRef= ref(storage,`comments/${userId}/${docId}`);
                       const uploadResult= await uploadBytes(locationRef,edit.file);
                      const url= await getDownloadURL(uploadResult.ref);
                      await updateDoc(doc(db, 'comments', `${docId}`),{ photo:url});
                    }
                }
               
            }
            catch(error){
                console.log(error);
                
            }
            finally{
                setEdit(prev=>{
                    return{
                        ...prev,
                        isLoading:false,
                        isEdit:false,
                        file:null,
                    }
                })  
            }
        }
        async function handleDeleteImg(){
            if (user?.uid !== userId) return;
            try{
                if(photo){
                    const photoRef =ref(storage,`comments/${userId}/${docId}`);
                    await deleteObject(photoRef);
                    await updateDoc(doc(db, 'comments', `${docId}`), {
                        photo: deleteField(),
                      });
                }
            }
            catch(e){
                console.log(e);
            }
           
        }
       
        async function handleLikePlus(){
           const docRef = doc(db, 'comments', `${docId}`)
           
           if(user){
            await updateDoc(docRef,{ like: [...like,user.uid]});
            setLikeClicked(prev=>!prev);
           }
          
        }
        async function handleLikeMinus(){
            const docRef = doc(db, 'comments', `${docId}`)
            if(user){
            await updateDoc(docRef,{ like: [...like].filter(item=>item!==user.uid)});
            setLikeClicked(prev=>!prev);
         }
        }
        async function handleBookmark(){
            const docRef = doc(db, "comments", docId);
            if(user){
                await updateDoc(docRef,{ bookmark: [...bookmark,user.uid]});
                setBookmarkClicked(prev=>!prev);
               }
              
        }
        async function handleBookmarkCancel(){
            const docRef = doc(db, "comments", docId);
            if(user){
                await updateDoc(docRef,{ bookmark: [...bookmark].filter(item=>item!==user.uid)});
                setBookmarkClicked(prev=>!prev);
               }
              
        }

        function handleReplyClick(){
            setReplyClicked(true);
        }
         
        function handleReplyClose(){
            setReplyClicked(false);
        }
        function handleGoRetweet(){
            navigate(`/retweet/${docId}`);
        }

        return  <Wrapper >
             <Column>
             <Row>      
                <Div>
                <Avatar> 
                        {profileImg
                        ? <AvatarImg src={profileImg}/>
                        :(
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                            </svg>
                        ) 
                        }
                 </Avatar>
                <UserName>{userName}</UserName>
                <UploadedDate>{updatedDate}</UploadedDate>
                </Div>
              
              {user?.uid===userId ? (
                <Div>
                <EditBtn onClick={handleEditBtn}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                    <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
                    <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
                    </svg>
                </EditBtn>
                <DeleteBtn onClick={handleDeleteBtn}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                </DeleteBtn>  
                </Div>

              ) :  null}
            </Row>  
        </Column>

        {/* 수정 x */}
        {!edit.isEdit ?  ( 
            <>
            <TextAndPhoto onClick={handleGoRetweet}>
                <Column>
                <Payload>{tweet}</Payload> 
                </Column>
                
                <Column>
                    {photo ? <Photo src={photo}/> : null}
                </Column>

            </TextAndPhoto>
           
    
            <ReplyContainer>
                {likeClicked? (
                    <NonLike onClick={handleLikeMinus}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                        </svg>
                        <span>{like.length!==0 && like.length}</span>
                    </NonLike>
                ):(
                    <Like onClick={handleLikePlus}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                        </svg>
                        <span>{like.length!==0 && like.length}</span>   
                    </Like>
                )}
                    


                    <Reply onClick={handleReplyClick}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
                        </svg>                     
                        <span>{commentsLength!==0 && commentsLength}</span>   

                    </Reply>
                    {bookmarkClicked ? (
                        <NonBookmark onClick={handleBookmarkCancel}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                        </svg>

                        </NonBookmark>
                    ):(
                        <Bookmark onClick={handleBookmark}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                        </svg>
                    </Bookmark>
                    )}
                    <Share>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                        </svg>
                    </Share>
            </ReplyContainer>
            </>
        ) : 
        //  수정중
        (
            <>
            <Column>
                <EditTextArea required value={edit.tweet} onChange={handleChange}></EditTextArea>
           </Column>
           
            <Column>
         
               {photo ? (
                <Wrapper2>
                    <Photo src={photo}/> 
                    <DeleteImg onClick={handleDeleteImg}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z" clipRule="evenodd" />
                        </svg>
                    </DeleteImg>
                </Wrapper2>
                
                
            ): null}
           </Column>
           
           <Wrapper3>
                <FileCondition>
                    {edit.file ? "Photo added ✅" : ''}

                </FileCondition>
                <EditTextLabel htmlFor="editFile">
                <InputItem>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                            <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z"  />
                            </svg>
                </InputItem>
                </EditTextLabel>
                <EditTextInput id="editFile" type="file" accept="image/*" hidden onChange={handleFileEdit} />
                <UpdateBtn onClick={handleUpdate}>{edit.isLoading ? 'Updating...' : 'Update'}</UpdateBtn>
                <CancelBtn onClick={handleCancel}>Cancel</CancelBtn>
           </Wrapper3>
           </>
        )}
         {replyClicked&&modal  && createPortal(<ReplyModal2 parentCommentId={docId} onClose={handleReplyClose} profileImg ={profileImg} userName={userName} updatedDate={updatedDate} tweet={tweet}></ReplyModal2>,modal)}

       

        </Wrapper>
        
      
       
        


}