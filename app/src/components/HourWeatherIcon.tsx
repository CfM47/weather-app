import { WeatherInfo } from '@/app/page'
import { format, parseISO } from 'date-fns'
import React from 'react'
import convertKelvinToCelsius from '../utils/convertKelvingToCelsius'
import WeatherIcon from './WeatherIcon'

type Props = {
    data: WeatherInfo,
}

export default function HourWeatherIcon(props: Props) {
    return (
        <div className="flex flex-col justify-between gap-2 items-center text-xs font-semibold">
            <p className="whitespace-nowrap">{format(parseISO(props.data.dt_txt), "h:mm a")}</p>
            <WeatherIcon iconName={props.data?.weather[0].icon}  dateTimeString={props.data?.dt_txt}></WeatherIcon>
            <p>{convertKelvinToCelsius(props.data?.main.temp ?? 297)}º</p>
        </div>
    )
}