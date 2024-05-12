export default function stringTotime(time:string){

    const dat1 = new Date(time);
    const dat2 = new Date();
    // @ts-ignore
    const timeDifference = dat2 - dat1;
    const hours = Math.floor(timeDifference / (1000 * 60 * 60));
    const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

    return {hours , minutes, seconds}
}