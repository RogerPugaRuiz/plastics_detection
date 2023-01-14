import torch.nn.functional as F
import torch.nn as nn
import numpy as np
import torch
import os
import utils
import csv
import sys
import torchvision.transforms as transforms
import parameters
import time
import pandas as pd

from PIL import Image as Im

"""
Convolutional neural network module
"""


class Net(nn.Module):
    """ class that inherits the model object """

    def __init__(self, params, source_data_dir, output_data_dir):
        super(Net, self).__init__()
        self.target_class = "plastic"
        self.source_data_dir = source_data_dir
        self.output_data_dir = output_data_dir
        C_in, H_in, W_in = params["input_shape"]
        init_f = params["initial_filters"]
        num_fc1 = params["num_fc1"]
        num_fc2 = params["num_fc2"]
        num_classes = params["num_classes"]
        self.dropout_rate = params["dropout_rate"]

        self.conv1 = nn.Conv2d(C_in, init_f, kernel_size=1)
        h, w = self.findConv2dOutShape(H_in, W_in, self.conv1, pool=2)

        self.conv2 = nn.Conv2d(init_f, 2*init_f, kernel_size=1)
        h, w = self.findConv2dOutShape(h, w, self.conv2, pool=2)

        self.conv3 = nn.Conv2d(2*init_f, 4*init_f, kernel_size=1)
        h, w = self.findConv2dOutShape(h, w, self.conv3, pool=2)

        self.conv4 = nn.Conv2d(4*init_f, 8*init_f, kernel_size=1)
        h, w = self.findConv2dOutShape(h, w, self.conv4, pool=2)

        # compute the flatten size
        self.num_flatten = h*w*8*init_f

        print("creating the network object...")
        print("source data dir = " + source_data_dir)
        print("C_in = " + str(C_in) + "\nH_in = " +
              str(H_in) + "\nW_in = " + str(W_in))
        print("initial filters = " + str(init_f))
        print("num_fc1 = " + str(num_fc1))
        print("num_fc2 = " + str(num_fc2))

        print("number of elements flattended =" + str(self.num_flatten))
        self.fc1 = nn.Linear(self.num_flatten, num_fc1)
        self.fc2 = nn.Linear(num_fc1, num_fc2)
        self.fc3 = nn.Linear(num_fc2, num_classes)

    def forward(self, x):

        x = F.relu(self.conv1(x))
        x = F.max_pool2d(x, 2, 2)

        x = F.relu(self.conv2(x))
        x = F.max_pool2d(x, 2, 2)

        x = F.relu(self.conv3(x))
        x = F.max_pool2d(x, 2, 2)

        x = F.relu(self.conv4(x))
        x = F.max_pool2d(x, 2, 2)

        x = x.view(-1, self.num_flatten)

        x = F.relu(self.fc1(x))
        x = F.dropout(x, self.dropout_rate)

        x = F.relu(self.fc2(x))
        x = F.dropout(x, self.dropout_rate)

        x = self.fc3(x)
        return F.log_softmax(x, dim=1)

    def findConv2dOutShape(self, H_in, W_in, conv, pool=2):
        # get conv arguments
        kernel_size = conv.kernel_size
        stride = conv.stride
        padding = conv.padding
        dilation = conv.dilation

        # Ref: https://pytorch.org/docs/stable/nn.html
        H_out = np.floor(
            (H_in+2*padding[0]-dilation[0]*(kernel_size[0]-1)-1)/stride[0]+1)
        W_out = np.floor(
            (W_in+2*padding[1]-dilation[1]*(kernel_size[1]-1)-1)/stride[1]+1)

        if pool:
            H_out /= pool
            W_out /= pool
        return int(H_out), int(W_out)

    def start_detection(self):
        blank_image = np.zeros((200, 200, 3), np.uint8)
        print("start detection")
        # height, width, channel = blank_image.shape
        # bytesPerLine = 3 * width
        # qImg = QImage(blank_image.data, width, height,
        #               bytesPerLine, QImage.Format_RGB888)
        # self.pixmap = QPixmap(qImg)
        # self.imageLabel.setPixmap(self.pixmap)

        # INCOMING DATA
        path2data = os.path.join(self.source_data_dir)
        # get list of images
        filenames = os.listdir(path2data)
        size = len(filenames)

        print(filenames)
        # get the full path to images
        full_filenames = [os.path.join(path2data, f) for f in filenames]
        print(full_filenames)
        y_pd = [0.0] * (size)
        latitude = [0.0] * (size)
        longitude = [0.0] * (size)
        timestamp = [0.0] * (size)

        # OUTPUT FILE
        csv_header = ['filename', 'pred',
                      'latitude', 'longitude', 'timestamp']
        output_filename = self.output_data_dir + "/" + \
            utils.getSystemDateTime() + "_" + str(self.target_class) + "_output.csv"

        with open(output_filename, 'w', encoding='UTF8', newline='') as f:
            writer = csv.writer(f)
            # write the header
            writer.writerow(csv_header)

        # INFERENCE
        with torch.no_grad():

            for i in range(len(y_pd)):

                latitude[i], longitude[i], timestamp[i] = utils.extractGPSdata(
                    full_filenames[i])

                img = Im.open(full_filenames[i])

                # PREPROCESSING
                preprocess = transforms.Compose([
                    transforms.Resize(
                        (parameters.input_dim[0], parameters.input_dim[1]), interpolation=Im.NEAREST),
                    transforms.ToTensor(),
                    transforms.Normalize(
                        (0.485, 0.456, 0.406), (0.229, 0.224, 0.225))
                ])
                x = preprocess(img)

                # print("input_tensor_shaoe = " + str(x.shape))

                start = time.time()
                y_pred = self(x.unsqueeze(0).to(parameters.device).float())
                elapsed = time.time() - start

                y_pred = y_pred.cpu()

                y_pred_class_prob = torch.nn.functional.softmax(y_pred)
                y_pred = torch.argmax(y_pred_class_prob, axis=1)

                # y_pred_numpy = y_pred.detach().cpu().numpy()
                y_pred_numpy = y_pred.numpy()
                # y_pred_numpy = y_pred.cpu().detach().numpy()
                y_pred_item = y_pred_numpy.item()
                y_pred_class_prob = y_pred_class_prob.numpy()

                y_pd[i] = y_pred_item
                print("pred( " + str(self.target_class) + " ): " + str(y_pd[i]) + "  latitude: " + str(
                    latitude[i]) + "  longitude: " + str(longitude[i]) + "  timestamp = " + str(timestamp[i]))

                # discard samples without GPS data:
                if (latitude[i] == longitude[i] == timestamp[i] == -1):
                    continue

                else:

                    output_data = [full_filenames[i], y_pd[i],
                                   latitude[i], longitude[i], timestamp[i]]

                    with open(output_filename, 'a+', encoding='UTF8', newline='') as f:
                        # write the data
                        writer = csv.writer(f)
                        writer.writerow(output_data)

            # PLOT THE RESULTS ON SCREEN:
            # 0. Extract the data from the generated output file:
            output_file_dir = output_filename
            # detections_np = np.genfromtxt(output_file_dir, delimiter=',')

            detections_np = pd.read_csv(output_file_dir, delimiter=',')
            pred_list = detections_np.iloc[:, 1]  # .tolist()
            lat_list = detections_np.iloc[:, 2]  # .tolist()
            lon_list = detections_np.iloc[:, 3]  # .tolist()
            # area_dot = [20] * len(detections_np[0])


class Init():
    """ Class that is responsible for starting the model """

    def __init__(self, params_model, model_dir, source_data_dir, output_data_dir) -> None:
        # MODEL
        cnn_model = Net(params=params_model,
                        source_data_dir=source_data_dir,
                        output_data_dir=output_data_dir)

        # load state_dict into model
        cnn_model.load_state_dict(torch.load(model_dir))
        cnn_model = cnn_model.float()
        # move model to device
        # cnn_model=cnn_model.to(device)
        # set model in evaluation mode
        cnn_model.eval()

        cnn_model.start_detection()
