
# Importing the required modules
import cv2
import face_recognition
import pickle
import os

# Setting the path where all the user images are present
folderPath='faces'
pathList=os.listdir(folderPath)

# List to store images of the users
img_list=[]

# List to store Email Addresses of the userd
emails=[]

for path in pathList:

    # Storing images in img_list
    img_list.append(cv2.imread(os.path.join(folderPath,path)))

    # Storing emails of users by splitting the name of image (email.extension) to email,extension
    emails.append(os.path.splitext(path)[0])

# Function to find encodings
def findEncodings(img_list):
    encodes=[]
    for img in img_list:

        # Converts an image from the BGR color space to the RGB color space
        img = cv2.cvtColor(img,cv2.COLOR_BGR2RGB)

        # Finding encodings of the img
        encode = face_recognition.face_encodings(img)[0]

        # Appending the encoding to encodes list
        encodes.append(encode)
    
    return encodes

# Calling function
encodes = findEncodings(img_list)

# Storing the emails and corresponding encodings in a list
emails_encodes=[emails,encodes]

# Storing the emails_encodes in pickle file for further use
file=open("Encodings.p","wb")
pickle.dump(emails_encodes,file)
file.close()