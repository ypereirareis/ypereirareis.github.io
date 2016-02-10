FROM ypereirareis/docker-node-modules

MAINTAINER Yannick Pereira-Reis <yannick.pereira.reis@gmail.com>

ENV USERNAME bob
ENV USERHOME /home/$USERNAME
ENV USERID 1000

RUN curl -O http://ftp.ruby-lang.org/pub/ruby/2.1/ruby-2.1.2.tar.gz && \
      tar -zxvf ruby-2.1.2.tar.gz && \
      cd ruby-2.1.2 && \
      ./configure --disable-install-doc && \
      make && \
      make install && \
      cd .. && \
      rm -r ruby-2.1.2 ruby-2.1.2.tar.gz && \
      echo 'gem: --no-document' > /usr/local/etc/gemrcdoc

RUN apt-get update && apt-get install -qqy \
    libgtk2.0-0 \
    libgdk-pixbuf2.0-0 \
    libfontconfig1 \
    libxrender1 \
    libx11-6 \
    libglib2.0-0 \
    libxft2 \
    libfreetype6 \
    libc6 \
    zlib1g \
    libpng12-0 \
    libstdc++6-4.8-dbg-arm64-cross \
    libgcc1

# Install jekyll
RUN gem install jekyll \
    jekyll-paginate

RUN groupadd -f -g $USERID $USERNAME && \
    useradd -u $USERID -g $USERNAME $USERNAME && \
    mkdir -p $USERHOME && \
    chown -R $USERNAME:$USERNAME $USERHOME && \
    adduser bob sudo

USER bob

VOLUME ["/app"]
WORKDIR /app
EXPOSE 4000
CMD []

