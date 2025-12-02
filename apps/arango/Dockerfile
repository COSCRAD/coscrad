from arangodb

# run adduser -G dbusergroup

workdir /arango

copy apps/arango/arangod.conf /etc/arangodb3/arangod.conf
run echo "endpoint = tcp://178.80.0.2:8529" > /etc/arangodb3/arangod.conf

EXPOSE 8529

# create the non-root user
# run arangosh --server.username root --server.password ${ARANGO_ROOT_PASSWORD} --server.database _system 


cmd ["tail","-f","/dev/null"]



