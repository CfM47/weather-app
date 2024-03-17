export function metersToKilometers(visibilityInMeters: number) : string{
    const visibilityInKm= visibilityInMeters / 1000
    return `${visibilityInKm.toFixed(0)}km`
}