#!/bin/bash

# Step 1: Create a temporary app.yaml from the hidden .app.yaml
cp .app.yaml app.yaml

# Step 2: Deploy the application
gcloud app deploy

# Step 3: Remove the temporary app.yaml
rm app.yaml
