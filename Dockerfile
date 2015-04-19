FROM ypereirareis/docker-node-modules

MAINTAINER Yannick Pereira-Reis <yannick.pereira.reis@gmail.com>


# Install common libs
RUN apt-get update && apt-get install -y \
	ruby \
	ruby-dev \
	make \
	gcc \
	rubygems-integration 

RUN apt-get update && apt-get install -qqy libgtk2.0-0 libgdk-pixbuf2.0-0 libfontconfig1 libxrender1 libx11-6 libglib2.0-0  libxft2 libfreetype6 libc6 zlib1g libpng12-0 libstdc++6-4.8-dbg-arm64-cross libgcc1

# Install jekyll
RUN gem install jekyll

VOLUME ["/app"]

WORKDIR /app

EXPOSE 4000

CMD []
