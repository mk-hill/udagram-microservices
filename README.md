# Udagram

Udagram is a simple cloud application developed alongside the Udacity Cloud Engineering Nanodegree. It allows users to register and log into a web client, post photos to the feed, and process photos using image filtering.

It was originally built as a monolith and has been converted to use a microservice architecture.

The project is split into five parts:

1. [The Simple Frontend](https://github.com/mk-hill/udagram-microservices/tree/master/frontend)
   a basic Ionic client web application which consumes the RestAPI Backend.
2. [The Feed Microservice](https://github.com/mk-hill/udagram-microservices/tree/master/feed), a Node-Express application which handles feed items.
3. [The User Microservice](https://github.com/mk-hill/udagram-microservices/tree/master/user), a Node-Express application handling users and authentication.
4. [The Image Filtering Microservice](https://github.com/mk-hill/udagram-microservices/tree/master/filter), the final project for the previous course. It is a Node-Express application which runs a simple script to process images.
5. [The Reverse Proxy](https://github.com/mk-hill/udagram-microservices/blob/master/deployment/docker/nginx.conf), a basic NGINX server handling routing for the application.

![Udagram](./screenshots/application.png 'Udagram client')

## Table of contents

- [Running locally](#running-locally)
- [Docker images](#docker-images)
- [CI/CD](#cicd)
- [Deploying Kubernetes cluster](#deploying-kubernetes-cluster)

---

## Running locally

You'll need to have [Node.js](https://nodejs.org/) and [Docker](https://docs.docker.com/get-docker/) available to run the build and run the application locally as described here. You'll also need to provide it access to a database and an [S3 bucket](https://aws.amazon.com/s3/).

- Set environment variables

```bash
export UDAGRAM_DB_USERNAME=<username>
export UDAGRAM_DB_PASSWORD=<password>
export UDAGRAM_DB_DATABASE=<db-name>
export UDAGRAM_DB_HOST=<db-host>
export UDAGRAM_DB_DIALECT=<db-dialect>
export UDAGRAM_AWS_REGION=<aws-region>
export UDAGRAM_AWS_PROFILE=<aws-profile>
export UDAGRAM_AWS_MEDIA_BUCKET=<media-bucket>
export JWT_SECRET=<jwt-secret-string>
```

- Build the docker images

  `npm run build`
  
  ![npm run build](./screenshots/npm-build.png 'npm run build')

- Start the application

  `npm start`

  ![npm start](./screenshots/npm-start.png 'npm start')

## Docker images

The images for the application can be found on [Docker Hub](https://hub.docker.com/):

- [mkhill/udagram-frontend](https://hub.docker.com/repository/docker/mkhill/udagram-frontend)
- [mkhill/udagram-filter](https://hub.docker.com/repository/docker/mkhill/udagram-filter)
- [mkhill/udagram-feed](https://hub.docker.com/repository/docker/mkhill/udagram-feed)
- [mkhill/udagram-user](https://hub.docker.com/repository/docker/mkhill/udagram-user)
- [mkhill/reverseproxy](https://hub.docker.com/repository/docker/mkhill/reverseproxy)

## CI/CD

![Travis CI](./screenshots/travis-ci-1-passing.png 'Travis CI build passing')

Udagram uses [Travis CI](https://travis-ci.com/) to automate the following:

- Building new docker images

![Travis CI](./screenshots/travis-ci-2-setup.png 'Travis CI setting up dependencies before building images')
![Travis CI](./screenshots/travis-ci-3-build-complete.png 'Travis CI building images')

- Pushing the new images to Docker Hub

![Travis CI](./screenshots/travis-ci-4-push.png 'Travis CI pushing images')

- Applying any Kubernetes deployment configuration changes and deploying the new images to an Amazon EKS cluster.

![Travis CI](./screenshots/travis-ci-5-deploy.png 'Travis CI building deploying to AWS')

The [.travis.yml](https://github.com/mk-hill/udagram-microservices/blob/master/.travis.yml) file contains the scripts used to do so, and can be adapted to your cloud provider of choice.

## Deploying Kubernetes cluster

- Create [Kubernetes](https://kubernetes.io/) cluster
- Install [kubectl](https://docs.aws.amazon.com/eks/latest/userguide/install-kubectl.html)
- Set up [kubeconfig](https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/) file
- Create your [secrets](https://kubernetes.io/docs/concepts/configuration/secret/)
- Apply deployment options

  `npm run apply-deployments`

  ![npm run apply-deployments](./screenshots/npm-apply.png 'npm run apply-deployments')

- Rollout updates

  `npm run rollout`

  ![npm run rollout](./screenshots/npm-rollout.png 'npm run rollout')

- Once your cluster is deployed you can monitor and scale it using kubectl.

  ![kubectl](./screenshots/kubectl-pods-scaling.png 'kubectl usage example')
  
> _This will deploy the latest versions of the Docker images listed above. Building, publishing, and deploying your own modified copies of the images will require further modification of the Docker and Kubernetes configuration files in the project._