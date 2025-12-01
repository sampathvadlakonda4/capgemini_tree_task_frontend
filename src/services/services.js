import axios from 'axios'
const backendUrl = import.meta.env.VITE_BACKEND_URL
const fetchData = async ()=>{
    const url = `${backendUrl}data`
    try{
        const getData = await axios.get(url);
        return getData?.data || [];
    }
    catch(err){
        console.error(err);
    }
}
export {
    fetchData
}