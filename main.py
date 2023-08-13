
# Importing the required modules
import cv2
import pickle
import face_recognition
import numpy as np
import cvzone
from statistics import mode
from tkinter import messagebox

# import encodegenerator       # Always encode the images present in faces folder before running the below code    

# Dimensions of frames captured by camera
cap = cv2.VideoCapture(0)    # Access default camera of the system (camera at index 0)
cap.set(3,400)               # First args 3 and 4 are properties used to control width and height of the frames. The second args, 400 and 480, are the values that these properties are set to
cap.set(4,400)               # The second args 400 and 400 are setting the width to 640 pixels and height to 480 pixels. So the frames captured will have a resolution of 640x480

# Accessing encodings of images stored in EncodeFile.p
file = open('Encodings.p','rb')
emails_encodes = pickle.load(file)
file.close()

# Storing emails in a seperate list and encodings in a seperate list
emails , encodes = emails_encodes

# List to store the Email Address of the user who gets recognized or invalid if user is not recognized
recognized=[]

# To display alert message
# messagebox.showinfo("Face Recognition", "Press Enter to Exit from Face Recognition Process after Some Seconds of Webcam Popup")

while True:

    success,img = cap.read()   # cap.read() is a method used to capture a frame from a video source, such as a webcam. The method returns a tuple containing two values:
                               # success: A boolean value indicating whether the frame was successfully captured or not
                               # img: A numpy array representing the captured frame
    
    # Converts an image from the BGR color space to the RGB color space
    img_new = cv2.cvtColor(img,cv2.COLOR_BGR2RGB) 
 
    # Detecting locations of faces in img_new
    faces_webcam = face_recognition.face_locations(img_new)

    # Generating feature vectors for faces detected above
    encodes_webcam = face_recognition.face_encodings(img_new,faces_webcam)


    for faces_webcam,encodes_webcam in zip(faces_webcam,encodes_webcam):

        # comparing encodes from file and encodes_webcam generated using webcam and finding matches
        matches = face_recognition.compare_faces(encodes,encodes_webcam)

        # Finding the distances with which the encodings matched with each other (less distance = more match)
        face_dis = face_recognition.face_distance(encodes,encodes_webcam)
        
        # Finding the index with least distance to consider the email at that index in emails list as answer
        match_index = np.argmin(face_dis)

        if matches[match_index] and face_dis[match_index] < 0.5:  # Treshhold value to be considered is 0.5
            
            # Storing the recognized email into list named recognized
            recognized.append(emails[match_index])

            # Generating a green colored rectangular shape around the faces detected in webcam video
            y1,x2,y2,x1 = faces_webcam
            bbox = x1,y1,x2-x1,y2-y1
            img = cvzone.cornerRect(img,bbox,rt=0)
    
    # Name of the webcam application
    cv2.imshow("Face Recognition",img)
    
    # User interruption while detecting faces
    k = cv2.waitKey(1)     # cv2.waitkey(1) waits for 1 milli sec for user interruption

    if k == 13:   # 13 is ascii value of 'Enter' key
        break   # Comes out of the loop when user presses 'Enter' key

if recognized:
    print(mode(recognized))   # Returns most frequent occured email as output
else:
    print("Invalid")   # Returns Invalid if face is not recognized