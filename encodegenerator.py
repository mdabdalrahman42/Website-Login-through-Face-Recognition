
# Importing the required modules
import cv2
import face_recognition
import pickle
import os
import sys

# Setting the path where all the user images are present
folderPath='faces'
pathList=os.listdir(folderPath)

# Accessing encodings of images stored in EncodeFile.p
file = open('Encodings.p','rb')
emails_encodes = pickle.load(file)
file.close()

# Storing emails in a seperate list and encodings in a seperate list
emails , encodes = emails_encodes

# Transferring email from node.js to train the algorithm for that particular image with name as users email
email = sys.argv[1]
emails.append(email)

for image in pathList:

    # Training the algorithm only if the filename and email matches
    if os.path.splitext(image)[0] == email:
        
        img = cv2.imread(os.path.join(folderPath,image))
        break

# Converting image readings from bgr to rgb
img = cv2.cvtColor(img,cv2.COLOR_BGR2RGB)

# Finding face encodings
encoding = face_recognition.face_encodings(img)[0]
encodes.append(encoding)

# Storing the emails and corresponding encodings in a list
emails_encodes=[emails,encodes]

# Storing the emails_encodes in pickle file for further use
file=open("Encodings.p","wb")
pickle.dump(emails_encodes,file)
file.close()