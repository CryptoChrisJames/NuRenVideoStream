# Initializing Variables
_imagetag=nurenstream
echo $_imagetag

# Initializing functions
buildImage()
{    
    docker build -t "$_imagetag" .
}

removeOldImage()
{
    docker rmi $_imagetag
}

pruneImages()
{
    docker image prune --force
}

awsLogin()
{
    aws ecr get-login --no-include-email --region us-east-2 | bash
}

ecrPush()
{
    docker tag $_imagetag:latest 614222560511.dkr.ecr.us-east-2.amazonaws.com/$_imagetag:latest
    docker push 614222560511.dkr.ecr.us-east-2.amazonaws.com/$_imagetag:latest
}



pruneImages
echo $?

if [ "$(docker images $_imagetag)" == "" ]; then
    echo $?
    buildImage
else
    echo $?
    removeOldImage
    buildImage
fi

awsLogin

ecrPush