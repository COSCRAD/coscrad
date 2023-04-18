/* groovylint-disable DuplicateStringLiteral */
/* groovylint-disable-next-line CompileStatic */
pipeline {
    agent any
    options {
        buildDiscarder logRotator(artifactDaysToKeepStr: '', artifactNumToKeepStr: '5', numToKeepStr: '5')
        disableConcurrentBuilds()
    }
    stages {
        stage('Test Jenkins Out') {
            agent any
            steps {
                echo 'CI Triggered...'
            }
        }
        stage('ci') {
            agent {
                docker {
                    image 'node:18-alpine'
                    args '-u root'
                }
            }
            environment {
                NODE_ENV = 'test'
                NODE_PORT = 3131
                ARANGO_DB_HOST_DOMAIN = 'arangotest.digiteched.com'
                ARANGO_DB_HOST_SCHEME = 'https'
                ARANGO_DB_HOST_PORT = 443
                ARANGO_DB_ROOT_PASSWORD = credentials('arango-test-root-password')
                ARANGO_DB_USER = 'dbuser'
                ARANGO_DB_USER_PASSWORD = credentials('arango-test-db-user-password')
                ARANGO_DB_NAME = 'staging'
                AUTH0_ISSUER_URL = 'https://foo.auth0.com/'
                AUTH0_AUDIENCE = 'https://bar.mydomain.ca'
                BASE_DIGITAL_ASSET_URL = 'https://www.myaudio.com:5555/media?id='
                GLOBAL_PREFIX = 'api'
                SHOULD_ENABLE_LEGACY_GAMES_ENDPOINT = 'false'
            }
            when {
                branch 'PR-*'
            }
            steps {
                configFileProvider([configFile(fileId:'42feff14-78da-45fc-a8ee-5f98213a313f',  \
            targetLocation: 'apps/coscrad-frontend/src/auth_config.json')]) {
                    echo 'PR opened or updated...'
                    echo "NODE ENV: ${NODE_ENV}"
                    echo 'Installing dependencies'
                    sh 'npm ci --legacy-peer-deps'

                    echo 'Running lint on all COSCRAD projects'
                    sh 'npm run lint:coscrad'

                /**
                * Note that the sample content config is actually valid for
                * our staging build.
                **/
                    echo 'copying sample content config for test build'
                /* groovylint-disable-next-line LineLength */
                    sh 'cp apps/coscrad-frontend/src/configurable-front-matter/data/content.config.SAMPLE.ts apps/coscrad-frontend/src/configurable-front-matter/data/content.config.ts'

                    echo 'Building COSCRAD'
                    echo 'with node version'
                    sh 'node --version'
                    sh 'npm run build:coscrad:prod'

                    echo 'testing coscrad-frontend'
                    sh 'npx nx test coscrad-frontend'

                    echo 'testing api (coscrad back-end)'

                /**
                * While the test falls back to `process.env` whenever there is
                * no value from `test.env` we have added an empty `test.env`
                * as a hack because by some quirk the mock config implementation
                * fails when no file is found.
                **/
                    echo 'creating empty test.env file'
                /* groovylint-disable-next-line LineLength */
                    sh 'touch apps/api/src/app/config/test.env'

                    sh 'npx nx test api'
            }
            }
                post {
                    success {
                        archiveArtifacts artifacts: 'dist/**, node_modules/**', followSymlinks: false
                    }
                }
        }
    }
}
