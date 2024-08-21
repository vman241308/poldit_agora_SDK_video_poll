#!/bin/bash
set -e

# Define the name of the secret and the namespace
NAMESPACE="backend"
CONFIGMAP_NAME="poldit-config-map"

# Define the path to your .env file
ENV_FILE=".env"

check_for_existing_kubeconfig() {
  echo "Check for existing Kubeconfig file..."

    if [ ! -f "kubeconfig.yaml" ]; then
    echo "The kubeconfig file does not exist.  Please download and place in root of project"
    exit 1
  fi

}

# Step 1: Update current ConfigMap
update_configmap() {
  echo "Updating existing ConfigMap..."

  # Generate the ConfigMap manifest dynamically
  configmap_manifest=$(kubectl --kubeconfig='./kubeconfig.yaml' \
    create configmap "$CONFIGMAP_NAME" \
    --dry-run=client \
    --from-env-file="$ENV_FILE" \
    -n "$NAMESPACE" \
    -o json)

  #Modify value of APP_ENV to "production"
  updated_configmap_manifest=$(echo "$configmap_manifest" | sed 's/"APP_ENV": "[^"]*"/"APP_ENV": "production"/')

  # Patch the ConfigMap to add the last-applied-configuration annotation
  echo "$updated_configmap_manifest" > configmap.yaml
  kubectl --kubeconfig='./kubeconfig.yaml' \
    apply -f configmap.yaml -n "$NAMESPACE"

  # Clean up the temporary configmap.yaml file
  rm configmap.yaml
}

#Step 4 Go through Git Steps
push_to_git() {
  echo "Adding changes to git..."
  git add .
  echo "Enter commit message:"
  read -r commit_message
  git commit -m "$commit_message"
  echo "Pushing changes to the repo..."
  git push
}

# Execute the steps
check_for_existing_kubeconfig
update_configmap
push_to_git