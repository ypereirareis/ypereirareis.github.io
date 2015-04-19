VERT="\\033[1;32m"
NORMAL="\\033[0;39m"
ROUGE="\\033[1;31m"
ROSE="\\033[1;35m"
BLEU="\\033[1;34m"
BLANC="\\033[0;02m"
BLANCLAIR="\\033[1;08m"
JAUNE="\\033[1;33m"
CYAN="\\033[1;36m"

IMAGE_NAME='docker-ypereirareis'

log() {
  echo -e "$BLEU > $1 $NORMAL"
}

error() {
  echo -e -n "$ROUGE"
  echo " >>> ERROR - $1"
  echo -e -n "$NORMAL"
}

build() {
  docker build -t $IMAGE_NAME .
  [ $? != 0 ] && error "Docker image build failed !" && exit 100
}

install() {
  log "NPM install"
  docker run -it --rm -v $(pwd):/app $IMAGE_NAME npm install
  [ $? != 0 ] && error "Npm install failed !" && exit 101
}

bower() {
  log "Bower install"
  docker run -it --rm -v $(pwd):/app $IMAGE_NAME /bin/bash -c "CI=false bower install --allow-root install"
  [ $? != 0 ] && error "Bower install failed !" && exit 102
}

jkbuild() {
  log "Jekyll build"
  docker run -it --rm -v $(pwd):/app $IMAGE_NAME jekyll build
  [ $? != 0 ] && error "Jekyll build failed !" && exit 103
}

grunt() {
  log "Grunt build"
  docker run -it --rm -v $(pwd):/app $IMAGE_NAME grunt
  [ $? != 0 ] && error "Grunt build failed !" && exit 104
}

jkserve() {
  log "Jekyll serve"
  docker run -it --rm -p 4000:4000 -v $(pwd):/app $IMAGE_NAME jekyll serve -H 0.0.0.0
  [ $? != 0 ] && error "Jekyll serve failed !" && exit 105
}

all() {
  echo "Installing full application at once  "
  install
  bower
  jkbuild
  grunt
  jkserve
}

bash() {
  log "BASH"
  docker run -it --rm -v $(pwd):/app $IMAGE_NAME bash
}

help() {
  echo "-----------------------------------------------------------------------"
  echo "                      Available commands                              -"
  echo "-----------------------------------------------------------------------"
  echo -e -n "$VERT"
  echo "   > build - To build the Docker image"
  echo "   > install - To install NPM modules/deps"
  echo "   > bower - To install Bower/Js deps"
  echo "   > jkbuild - To build Jekyll project"
  echo "   > grunt - To run grunt task"
  echo "   > jkserve - To serve the project/blog on 127.0.0.1:4000"
  echo "   > all - To execute full install at once"
  echo "   > bash - Log you into container"
  echo "   > help - Display this help"
  echo "-----------------------------------------------------------------------"
  echo -e -n "$NORMAL"


}

$*
