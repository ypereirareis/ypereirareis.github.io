FROM ypereirareis/docker-node-modules

MAINTAINER Yannick Pereira-Reis <yannick.pereira.reis@gmail.com>


# Install common libs
RUN apt-get update && apt-get install -y \
	ruby \
	ruby-dev \
	make \
	gcc \
	rubygems-integration	


# Install jekyll
RUN gem install jekyll

VOLUME ["/app"]

WORKDIR /app

EXPOSE 4000

CMD []
