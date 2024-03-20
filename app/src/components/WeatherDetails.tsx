import React from 'react'
import { FiDroplet } from 'react-icons/fi';
import { ImMeter } from 'react-icons/im';
import { LuEye, LuSunrise, LuSunset } from 'react-icons/lu'
import { MdAir } from 'react-icons/md';
import { metersToKilometers } from '../utils/metersToKilometers';
import { format, fromUnixTime } from 'date-fns';
import { convertWindSpeed } from '../utils/convertWindSpeed';

export interface WeatherDetailProps{
    visibility: number;
    humidity: number;
    windspeed: number;
    airPressure: number;
    sunrise: number;
    sunset: number;
}

export default function WeatherDetails(props: WeatherDetailProps) {
    let visibility = "25km"
    let humidity = "61%"
    let windspeed = "7 km/h"
    let airPressure = "1012 hPa"
    let sunrise = "6.20"
    let sunset = "18:48"

    visibility=metersToKilometers(props.visibility ?? 10000)
    airPressure=`${props.airPressure} hPa`
    humidity=`${props.humidity} %`
    sunrise=format(fromUnixTime(props.sunrise ?? 1702949452), "H:mm")
    sunset=format(fromUnixTime(props.sunset ?? 1702517657), "H:mm")
    windspeed=convertWindSpeed(props.windspeed ?? 1.64)
    
    return (
        <>
            <SingleWeatherDetail
                icon={<LuEye/>}
                information='Visibility'
                value={visibility}
            />
            <SingleWeatherDetail
                icon={<FiDroplet/>}
                information='Humidity'
                value={humidity}
            />
            <SingleWeatherDetail
                icon={<MdAir/>}
                information='Wind Speed'
                value={windspeed}
            />
            <SingleWeatherDetail
                icon={<ImMeter/>}
                information='Air Pressure'
                value={airPressure}
            />
            <SingleWeatherDetail
                icon={<LuSunrise/>}
                information='Sunrise'
                value={sunrise}
            />
            <SingleWeatherDetail
                icon={<LuSunset/>}
                information='Sunset'
                value={sunset}
            />
        </> 
    )
};

export interface SingleWeatherDetailProps{
    information: string
    icon: React.ReactNode
    value: string
}

function SingleWeatherDetail(props: SingleWeatherDetailProps){
    return (
        <div className='flex flex-col justify-between gap-2 items-center text-xs font-semibold text-black/80'>
            <p className='whitespace-nowrap'>{props.information}</p>
            <div className='text-3xl'>{props.icon}</div>
            <p>{props.value}</p>
        </div>
    )
}
