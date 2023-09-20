import { sendMsg, getMsgs } from '../Api';
import { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import Fab from '@mui/material/Fab';
import RefreshIcon from '@mui/icons-material/Refresh';
import CircularProgress from '@mui/material/CircularProgress';
import { TextareaAutosize } from '@mui/base/TextareaAutosize';


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
            const result = await sendMsg(game_id, {message: newMsg});
            if (result) {
                getChatMsgs();
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

    async function getChatMsgs() {
        setIsLoading(true);
        try {
            const result = await getMsgs(game_id);
            const jsonData = await result.json();
            console.log(jsonData);
            setMsgs(jsonData);
            setIsLoading(false);
        } catch(e) {
            navigate('/error');
        }
    };

    useEffect(() => {
        getChatMsgs();
    }, []);


    return (
        <div>
            {isLoading ? <CircularProgress size={150} className='loader' /> :
                <div>
                    <TextareaAutosize minRows={2} placeholder="Post a new message to chat" value={newMsg} onChange={handleNewMsgChange} style={{width: '320px', borderRadius: '12px 12px 0 12px'}} />
                    <Fab variant="extended" color="primary" aria-label="add" onClick={submitMsg}> Send </Fab>
                    <Fab aria-label="refresh" onClick={getChatMsgs}> <RefreshIcon /> </Fab>
                    {failedMsg ? 'could not send message' : ''}
                    <ul>
                        {msgs.map((msg, ind) =>
                            <li key={ind}>
                                <div>
                                    <p className='msgAuthor'>{msg.from}</p>
                                    <p className='message'>{msg.message}</p>
                                </div>
                            </li>)}
                    </ul>
                </div>}
        </div>
    );
};

export default Chat;