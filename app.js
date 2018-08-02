const fs = require('fs')
const exif = require('fast-exif')
const dms2dec = require('dms2dec')
main()

async function main() {
    const imgFileList = await getImgFileList()
    const gpsInfo = []
    for (let file of imgFileList) {
        gpsInfo.push({
            'fileName': file,
            'gpsInfo': await getGpsInfoByImage('img/' + file)
        })
    }
    console.log(gpsInfo)
}

function getImgFileList() {
    return new Promise(resolve => {
        fs.readdir('img/', function (err, files) {
            if (err) throw err;
            let fileList = files.filter(function (file) {
                return fs.statSync('img/' + file).isFile() && /.*\.jpg$|.*\.JPG$/.test(file); //絞り込み
            })
            resolve(fileList)
        })
    })
}

/**
 * getGpsInfoByImage - get GPS infomation from image
 *
 * @param {string} imagePath
 * @returns [lat, lng, altitude, date]
 */
function getGpsInfoByImage(imagePath) {
    return new Promise(resolve => {
        exif.read(imagePath)
            .then(function (d) {
                let exifLat = d.gps['GPSLatitude']
                let exifLng = d.gps['GPSLongitude']
                let latlng = dms2dec([exifLat[0], exifLat[1], exifLat[2]], d.gps['GPSLatitudeRef'], [exifLng[0], exifLng[1], exifLng[2]], d.gps['GPSLongitudeRef'])
                resolve([latlng[0], latlng[1], d.gps['GPSAltitude'], d['exif']['DateTimeOriginal']])
            })
    })
}