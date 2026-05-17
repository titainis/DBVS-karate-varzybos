import { useEffect, useState } from "react";


const Info = () => {

    const [info, setInfo] = useState<Athlete[]>([]);

    const fetchData =  async () => {
        const response = await fetch('https://astraja.vilniustech.lt:8443/ords/stud_732/karate/sportininkai');
        const data = await response.json();
        setInfo(data.items);
    }

    useEffect(() => {
        fetchData();
    }, [])

    return (
        <div>
            {info.map((item) => (
                <p key={item.sportininko_nr}>{item.sportininko_vardas}</p>
            ))}
        </div>
    )

}

export default Info;