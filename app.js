const fs = require('fs')
const exif = require('fast-exif')
const dms2dec = require('dms2dec')
main()

async function main() {
    const imgfiles = await loadImgfiles()
    console.log(imgfiles)
}

function loadImgfiles() {
    return new Promise(resolve => {
        fs.readdir('img/', function (err, files) {
            if (err) throw err;
            let fileList = files.filter(function (file) {
                return fs.statSync('img/' + file).isFile() && /.*\.jpg$|.*\.JPG$/.test(file); //絞り込み
            })
            try {
                const gpsInfo = []
                fileList.forEach(function (file) {
                    gpsInfo.push(getGpsInfoByImage('img/' + file))
                })
                Promise.all(gpsInfo).then(function (el) {
                    resolve(el)
                })
            } catch (error) {
                console.log(error)
            }
        })
    })
}

/**
 * getGpsInfoByImage - get GPS infomation from image
 *
 * @param {string} imagePath
 * @returns [lat, lng, altitude]
 */
function getGpsInfoByImage(imagePath) {
    return new Promise(resolve => {
        exif.read(imagePath)
            .then(function (d) {
                let exifLat = d.gps['GPSLatitude']
                let exifLng = d.gps['GPSLongitude']
                let latlng = dms2dec([exifLat[0], exifLat[1], exifLat[2]], d.gps['GPSLatitudeRef'], [exifLng[0], exifLng[1], exifLng[2]], d.gps['GPSLongitudeRef'])
                resolve([latlng[0], latlng[1], d.gps['GPSAltitude']])
            })
    })
}