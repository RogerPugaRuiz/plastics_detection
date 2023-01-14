from datetime import datetime
from exif import Image as exif_Image


def getSystemDateTime():

    # get the current time on starting the data aquisition
    datetime_object = datetime.now()
    datetime_string_1 = str(datetime_object)
    #print(datetime_string_1)
    datetime_string_2 = datetime_string_1.replace("-", "")
    datetime_string_3 = datetime_string_2.replace(" ", "_")
    datetime_string_4 = datetime_string_3.replace(":", "")
    date_time_at_start, nanosec = datetime_string_4.split(".")

    return date_time_at_start

def extractGPSdata(full_filename):
    GPS_EXIF_DATA = [
     'gps_latitude_ref',
     'gps_latitude',
     'gps_longitude_ref',
     'gps_longitude',
     'gps_altitude_ref',
     'gps_timestamp',
     'gps_satellites',
     'gps_img_direction_ref',
     'gps_map_datum',
     'gps_datestamp']

    with open(full_filename, 'rb') as src:
        #print("file name: " + str(full_filename))
        img=exif_Image(src)

        if img.has_exif:
            info = "file contain exif data"
        else:
            info = "does not contain any EXIF information"
            return -1, -1, -1

        latitude_data = getattr(img, GPS_EXIF_DATA[1], None)
        longitude_data = getattr(img, GPS_EXIF_DATA[3], None)
        timestamp = getattr(img, GPS_EXIF_DATA[9], None)

        if not (latitude_data and longitude_data):
            print("no exif data")
            return -1, -1, -1

        latitude=(latitude_data[0]+latitude_data[1]/60+latitude_data[2]/3600)*(-1)
        longitude=(longitude_data[0]+longitude_data[1]/60+longitude_data[2]/3600)*(-1)

        """
        print("latitude:  " + str(latitude))
        print("longitude:  " + str(longitude))
        print("timestamp: " + str(timestamp))
        """

        latitude = -1*latitude
        longitude = -1*longitude

        if((latitude > 41.2) or (latitude < 40.4)):
            return -1, -1, -1

        if((longitude > 1.6) or (latitude < 0.5)):
            return -1, -1, -1

        return latitude, longitude, timestamp


