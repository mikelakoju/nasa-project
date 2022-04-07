const axious = require('axios');

const launchesDatabase = require('./launches.mongo');
const planets = require('./planets.mongo');

const DEFAULT_FLIGHT_NUMBER = 100;

// const launches = new Map();


// let latestFlightNumber = 100;

// const launch = {
//     flightNumber: 100,  // coresponds to --> flight_number (in SpaceX API)
//     mission: 'Kepler Exploration X',  // coresponds to --> name (in SpaceX API)
//     rocket: 'Exploreer IS1',  // coresponds to --> rocket.name (in SpaceX API)
//     launchDate: new Date('December 27, 2030'), // coresponds to --> date_local
//     target: 'Kepler-442 b',  // not applicable
//     customers: ['ZTM', 'NASA'], //payload.customers for each payload
//     upcoming: true,  // upcoming
//     success: true,  // success
// };
// saveLaunch(launch);
// launches.set(launch.flightNumber, launch)

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

async function populateLaunches(){
    console.log('Downloading launch data...')
    const response = await axious.post(SPACEX_API_URL, {
            query: {},
            options: {
                pagination: false,
                populate:[
                    {
                        path:'rocket',
                        select:{
                            name: 1
                        }
                    },
                    {
                        path: 'payloads',
                        select: {
                            'customers': 1
                        }
                    }
                ]
            }
        
    });

    if (response.status != 200){
        console.log('Problem downloading launch data');
        throw new Error('Launch data download failed');
    }

    const launchDocs = response.data.docs;
    for (const launchDoc of launchDocs){
        const payloads = launchDoc['payloads'];
        const customers = payloads.flatMap((payload) => {
            return payload['customers'];
        })

        const launch = {
            flightNumber: launchDoc['flight_number'],
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate: launchDoc['date_local'],
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success'],
            customers:customers,

        };

        console.log(`${launch.flightNumber} ${launch.mission}`);

        // TODO: populate launches collection
        await saveLaunch(launch);
    }
}


async function loadLaunchData(){
    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat',
    });
    if (firstLaunch){
        console.log('Launch data already Loaded!');
        
    } else {
        await populateLaunches();
    }

    

async function findLaunch(filter) {
    return await launchesDatabase.findOne(filter);
}}

async function existsLaunchWithId(launchId){
    return await findLaunch({
        flightNumber: launchId,
    });
    // return launches.has(launchId);
}

async function getLatestFlightNumber(){
    const latestLaunch = await launchesDatabase
        .findOne()
        .sort('-flightNumber'); //decending order using the ' - '
    
    if (!latestLaunch){
        return DEFAULT_FLIGHT_NUMBER;
    }

    return latestLaunch.flightNumber;
}

async function getAllLaunches(skip, limit) {
    return await launchesDatabase
    // return Array.from(launches.values());
    .find({}, {'_id':0, '__v':0})
    .sort({flightNumber: 1}) //so that flight number can be sorted for our pagination (-1 decending & 1 accending)
    .skip(skip)
    .limit(limit);
   
}


// Save to mongo 
async function saveLaunch(launch){
    await launchesDatabase.findOneAndUpdate({
        flightNumber: launch.flightNumber,
    }, launch, {
        upsert: true
    });

}

async function scheduleNewLaunch(){
    const planet = await planets.findOne({
        keplerName: launch.target, //cheking to see if the planet exists
    });

    if (!planet) {
        throw new Error('No Matching planet found');
    }

    const newFlightNumber = await getLatestFlightNumber() + 1

    const newLaunch = Object.assign(launch, {
        success: true,
        upcoming: true,
        customers: ['Zero to Mastery', 'NASA'],
        flightNumber: newFlightNumber,
        
    });

    await saveLaunch(newLaunch);
}

// function addNewLaunch(launch){
//     latestFlightNumber++;
//     launches.set(
//         latestFlightNumber, 
//         Object.assign(launch, {
//             success: true,
//             upcoming: true,
//             customers: ['Zero to Mastery', 'NASA'],
//             flightNumber: latestFlightNumber,
//     }));
// }

async function abortLaunchById(launchId){
   const aborted = await launchesDatabase.updateOne({
        flightNumber: launchId,
    }, {
        upcoming: false,
        success: false,
    });
    return aborted.modifiedCount === 1;
    // const aborted = launches.get(launchId); //here
    // aborted.upcoming = false;
    // aborted.success = false;
    // return aborted;

}

module.exports = {
    loadLaunchData,
    existsLaunchWithId,
    getAllLaunches,
    // addNewLaunch,
    scheduleNewLaunch,
    abortLaunchById,
}