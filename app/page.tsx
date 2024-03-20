'use client'

import Image from "next/image";
import Navbar from "./src/components/Navbar";
import { useQuery } from "react-query";
import axios from "axios";
import { format, fromUnixTime, parseISO } from "date-fns";
import Container from "./src/components/Container";
import convertKelvinToCelsius from "./src/utils/convertKelvingToCelsius";
import WeatherIcon from "./src/components/WeatherIcon";
import getDayOrNightIcon from "./src/utils/getDayOrNightIcon";
import { metersToKilometers } from "./src/utils/metersToKilometers";
import WeatherDetails from "./src/components/WeatherDetails";
import { convertWindSpeed } from "./src/utils/convertWindSpeed";
import ForcastWeatherDetail from "./src/components/ForcastWeatherDetail";
import { loadingCityAtom, placeAtom } from "./atom";
import { useAtom } from "jotai";
import { useEffect } from "react";


//https://api.openweathermap.org/data/2.5/forecast?q=${place}&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}&cnt=56 

interface WeatherData {
  cod: string;
  message: number;
  cnt: number;
  list: WeatherInfo[];
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

interface WeatherInfo {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    sea_level: number;
    grnd_level: number;
    humidity: number;
    temp_kf: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  clouds: {
    all: number;
  };
  wind: {
    speed: number;
    deg: number;
    gust: number;
  };
  visibility: number;
  pop: number;
  sys: {
    pod: string;
  };
  dt_txt: string;
}


export default function Home() {
  const [place, setPlace] = useAtom(placeAtom)
  const [loadingCity, _] = useAtom(loadingCityAtom)   

  const { isLoading, error, data, refetch} = useQuery<WeatherData>('repoData', async () =>
    {
      const {data} = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${place}&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}&cnt=56`);
      return data;
    }
  );

  useEffect(() =>{refetch()}, [place, refetch]);
  
  
  const firstData = data?.list[0]

  const uniqueDates =[
    ...new Set(
      data?.list.map((entry) => new Date(entry.dt * 1000).toISOString().split("T")[0])
    )
  ]

  const firstDataForEachDate = uniqueDates.map((date) => {
    return data?.list.find((entry) => {
      const entryDate = new Date(entry.dt * 1000).toISOString().split("T")[0]
      const entryTime = new Date(entry.dt * 1000).getHours()
      return entryDate === date && entryTime >= 6;
    })
  })

  if (isLoading) return(
    <div className="flex items-center min-h-screen justify-center">
      <p className="animate-bounce">Loading...</p>
    </div>
  );
  
  return (
    <div className="flex flex-col gap-4 bg-gray-100 min-h-screen ">
      <Navbar location={data?.city.name}/>
      <main className="px-3 max-w-7xl mx-auto flex flex-col gap-9 w-full pb-10 pt-4">
        { loadingCity? <SkeletonLoadingComponent/> :
          <>
            <section className="space-y-4">
              <div className="space-y-2">
                <h2 className="flex gap-1 text-2xl items-end">
                  <p>{format(parseISO(firstData?.dt_txt ?? ''), 'EEEE')}</p>
                  <p className="text-lg">({format(parseISO(firstData?.dt_txt ?? ''), 'dd.MM.yyyy')})</p>
                </h2>
                <Container className="gap-10 px-6 items-center">
                  <div className="flex flex-col px-4">
                    <span className="text-5xl">{convertKelvinToCelsius(firstData?.main.temp ?? 296.37)}º</span>
                    <p className="text-xs space-x-1 whitespace-nowrap"><span>Feels Like</span><span>{convertKelvinToCelsius(firstData?.main.feels_like ?? 22)}º</span>
                      <p className="text-xs space-x-2"><span>{convertKelvinToCelsius(firstData?.main.temp_min ?? 22)}º↓{" "}</span>
                        <span>{" "}{convertKelvinToCelsius(firstData?.main.temp_min ?? 22)}º↑</span>
                      </p>
                    </p>
                  </div>
                  <div className="flex gap-10 sm:gap-10 overflow-x-auto w-full justify-between pr-3">
                    {data?.list.map((d,i)=>(
                      <div key={i} className="flex flex-col justify-between gap-2 items-center text-xs font-semibold">
                        <p className="whitespace-nowrap">{format(parseISO(d.dt_txt), "h:mm a")}</p>
                        <WeatherIcon iconName={getDayOrNightIcon(d?.weather[0].icon, d?.dt_txt)}></WeatherIcon>
                        <p>{convertKelvinToCelsius(d?.main.temp ?? 297)}º</p>
                      </div>
                    ))}
                  </div>
                </Container>
                <div>
                </div>
              </div>
              <div className="flex gap-4">
                <Container className="w-fit justify-center flex-col px-4 items-center">
                  <p className="capitalize text-center">{firstData?.weather[0].description}</p>
                  <WeatherIcon iconName={getDayOrNightIcon(firstData?.weather[0].icon ?? "", firstData?.dt_txt ?? "")}></WeatherIcon>
                </Container>
                
                <Container className="bg-yellow-300/80 px-6 gap-4 justify-between overflow-x-auto">
                  <WeatherDetails 
                    visibility={metersToKilometers(firstData?.visibility ?? 10000)} 
                    airPressure={`${firstData?.main.pressure} hPa`}
                    humidity={`${firstData?.main.humidity} %`}
                    sunrise={format(fromUnixTime(data?.city.sunrise ?? 1702949452), "H:mm")}
                    sunset={format(fromUnixTime(data?.city.sunset ?? 1702517657), "H:mm")}
                    windspeed={convertWindSpeed(firstData?.wind.speed ?? 1.64)}
                  />
                </Container>
              </div>
            </section>
            <section className="flex w-full flex-col gap-4">
              <p className="text-2xl">Forcast (7 days)</p>
              {firstDataForEachDate.map((d,i)=>(
                <ForcastWeatherDetail 
                  key={i}
                  description={d?.weather[0].description ?? ""}
                  weatherIcon={d?.weather[0].icon ?? "01d"}
                  date={format(parseISO(d?.dt_txt ?? ""), "dd.MM")}
                  day={format(parseISO(d?.dt_txt ?? ""), "EEEE")}
                  feels_like={d?.main.feels_like ?? 0}
                  temp={d?.main.temp ?? 0}
                  temp_max={d?.main.temp_max ?? 0}
                  temp_min={d?.main.temp_min ?? 0}
                  airPressure={`${d?.main.pressure} hPa`}
                  humidity={`${d?.main.humidity}%`}
                  sunrise={format(fromUnixTime(data?.city.sunrise ?? 1702517657), "H:mm")}
                  sunset={format(fromUnixTime(data?.city.sunset ?? 1702517657), "H:mm")}
                  visibility={`${metersToKilometers(d?.visibility ?? 10000)}`}
                  windspeed={`${convertWindSpeed(d?.wind.speed ?? 1.64)}`}
                />
              ))}
            </section>
          </>
        }
      </main>
    </div>
  );
}


function SkeletonLoadingComponent(){
  return (
    <main className="px-3 max-w-7xl mx-auto flex flex-col gap-9 w-full pb-10 pt-4">
      <section className="space-y-4">
        <div className="space-y-2">
          <h2 className="flex gap-1 text-2xl items-end">
            {/* Placeholder for day name and date */}
            <div className="animate-pulse h-5 w-20 bg-gray-200 rounded"></div>
          </h2>
          <Container className="gap-10 px-6 items-center">
            <div className="flex flex-col px-4">
              {/* Placeholder for temperature */}
              <div className="animate-pulse h-12 w-20 bg-gray-200 rounded"></div>
              {/* Placeholder for feels like temperature */}
              <div className="animate-pulse h-5 w-20 bg-gray-200 rounded"></div>
              <div className="text-xs space-x-1 whitespace-nowrap">
                {/* Placeholder for min and max temperature */}
                <div className="animate-pulse h-5 w-20 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="flex gap-10 sm:gap-10 overflow-x-auto w-full justify-between pr-3">
              {/* Placeholder for hourly weather */}
              {[1, 2, 3, 4, 5].map((index) => (
                <div key={index} className="flex flex-col justify-between gap-2 items-center text-xs font-semibold">
                  <div className="animate-pulse h-5 w-16 bg-gray-200 rounded"></div>
                  <div className="animate-pulse h-12 w-12 bg-gray-200 rounded-full"></div>
                  <div className="animate-pulse h-5 w-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </Container>
        </div>
        <div className="flex gap-4">
          <Container className="w-fit justify-center flex-col px-4 items-center">
            {/* Placeholder for weather description */}
            <div className="animate-pulse h-5 w-20 bg-gray-200 rounded"></div>
            {/* Placeholder for weather icon */}
            <div className="animate-pulse h-12 w-12 bg-gray-200 rounded-full"></div>
          </Container>
          <Container className="bg-gray-300/80 px-6 gap-4 justify-between overflow-x-auto">
            {/* Placeholder for weather details */}
            {[1, 2, 3].map((index) => (
              <div key={index} className="animate-pulse h-5 w-full bg-gray-200 rounded"></div>
            ))}
          </Container>
        </div>
      </section>
      <section className="flex w-full flex-col gap-4">
        <p className="text-2xl">Forcast (7 days)</p>
        {[1, 2, 3, 4, 5, 6, 7].map((index) => (
          <ForcastSkeleton key={index} />
        ))}
      </section>
    </main>
  );
};

// Placeholder for individual forecast item
const ForcastSkeleton = () => {
  return (
    <div className="animate-pulse flex gap-4">
      {/* Placeholder for forecast details */}
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((index) => (
        <div key={index} className="animate-pulse h-5 w-32 bg-gray-200 rounded"></div>
      ))}
    </div>
  );
};

