import { sendChatMsg, getChatMsgs } from '../Api';
import { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import Fab from '@mui/material/Fab';
import RefreshIcon from '@mui/icons-material/Refresh';
import CircularProgress from '@mui/material/CircularProgress';
import { TextareaAutosize } from '@mui/base/TextareaAutosize';
import Alert from '@mui/material/Alert';
import styles from './Styles/Chat.css';


function Chat() {
    const navigate = useNavigate();
    const { game_id } = useParams();
    const [msgs, setMsgs] = useState([]);
    const [newMsg, setNewMsg] = useState('');
    const [failedMsg, setFailedMsg] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    function handleNewMsgChange(e) {
        setNewMsg(e.target.value);
    }


    async function submitMsg(e) {
        e.preventDefault();
        setIsLoading(true);
        try {
            const result = await sendChatMsg(game_id, {message: newMsg});
            if (result) {
                getGameChatMsgs();
                setNewMsg('');
                setIsLoading(false);
            } else {
                setNewMsg('');
                setFailedMsg(true);
                setIsLoading(false);
            }

        } catch(e) {
            navigate('/error');
        }
    };

    async function getGameChatMsgs() {
        setIsLoading(true);
        try {
            const result = await getChatMsgs(game_id);
            const jsonData = await result.json();
            setMsgs(jsonData);
            setIsLoading(false);
        } catch(e) {
            navigate('/error');
        }
    };

    useEffect(() => {
        getGameChatMsgs();
    }, []);


    return (
        <div>
            
                <div className='chat'>
                    <div className='enter_msg'>
                        <TextareaAutosize minRows={2} placeholder="Post a new message to chat" value={newMsg} onChange={handleNewMsgChange} className='textArea'/>
                        <Fab variant="extended" color="primary" aria-label="add" onClick={submitMsg} className='sendMsg'> Send </Fab>
                        <Fab aria-label="refresh" onClick={getChatMsgs} className='chatRefresh'> <RefreshIcon /> </Fab>
                        {failedMsg ? <Alert severity="warning" className='chat_alert'>Could not send message</Alert> : ''}
                    </div>
                    {isLoading ? <CircularProgress size={80} className='msgs_loader' /> :
                    <ul className='chat_messages_container'>
                        {msgs.map((msg, ind) =>
                            <li key={ind}>
                                <p className='msgAuthor'>{msg.from}:</p>
                                <p className='message'>{msg.message}</p>
                            </li>)}
                    </ul>}
                </div>
        </div>
    );
};

export default Chat;