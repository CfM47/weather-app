export function convertWindSpeed(speedInMs: number):string{
    const speedInKmH = speedInMs * 3.6
    return `${speedInKmH.toFixed(0)}km/h`
}