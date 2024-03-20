import React from 'react'
import Image  from 'next/image'
import { cn } from '../utils/cn'
import getDayOrNightIcon from '../utils/getDayOrNightIcon'

export default function WeatherIcon(props: React.HTMLProps<HTMLDivElement> & {iconName:string} & {dateTimeString: string}) {
    const iconName = getDayOrNightIcon(props.iconName, props.dateTimeString)

    return (
        <div {...props} className={cn("relative h-20 w-20")}>
            <Image 
                width={100} 
                height={100} 
                alt='weather_icon' 
                className='absolute h-full w-full' 
                src={`https://openweathermap.org/img/wn/${iconName}@4x.png`}
            />
        </div>
    )
}