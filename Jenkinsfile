def nodeInstallationName = 'NodeJS 18.12.0'

/* groovylint-disable DuplicateStringLiteral */
/* groovylint-disable-next-line CompileStatic */
pipeline {
    agent any
    options {
        buildDiscarder logRotator(artifactDaysToKeepStr: '', artifactNumToKeepStr: '5', numToKeepStr: '5')
        disableConcurrentBuilds()
    }
    stages {
        stage('ci') {
            agent {
                label 'jenkins-build-agent'
            }
            tools { nodejs nodeInstallationName }
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
                GLOBAL_PREFIX = 'api'
                SHOULD_ENABLE_LEGACY_GAMES_ENDPOINT = 'false'
            }
            when {
                // TODO put me back
                // branch 'PR-*'
                expression { return false }
            }
            steps {
                copyConfig('COSCRAD')
                configFileProvider([configFile(fileId:'42feff14-78da-45fc-a8ee-5f98213a313f',  \
            targetLocation: 'apps/coscrad-frontend/src/auth_config.json')]) {
                    echo 'PR opened or updated...'
                    echo "NODE ENV: ${NODE_ENV}"
                    echo 'node version:'
                    sh 'node -v'
                    echo 'npm version'
                    sh 'npm -v'
                    echo 'Installing dependencies'
                    sh 'npm ci --legacy-peer-deps'

                    echo 'Running lint on all COSCRAD projects'
                    sh 'npm run lint:coscrad'

                    echo 'Building COSCRAD'
                    echo 'with node version'
                    sh 'node --version'
                    sh 'npm run build:coscrad:prod'

                    echo 'testing coscrad-frontend'
                    sh 'npx nx test coscrad-frontend --skip-nx-cache'

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

                    sh 'npx nx test api --skip-nx-cache'
            }
            }
        }
        stage('deploy to staging') {
            agent {
                label 'jenkins-build-agent'
            }
            tools { nodejs nodeInstallationName }
            environment {
                NODE_ENV = 'staging'
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
                GLOBAL_PREFIX = 'api'
                SHOULD_ENABLE_LEGACY_GAMES_ENDPOINT = 'false'
            }
            when {
                // TODO return this to integration
                branch '185261093-reuseable-staging-deployment'
            }
            // when {
            //     expression {
            //         return env.BRANCH_NAME == 'integration'
            //     }
            // }
            steps {
                copyConfig('Haida')
                configFileProvider([configFile(fileId:'42feff14-78da-45fc-a8ee-5f98213a313f',  \
            targetLocation: 'apps/coscrad-frontend/src/auth_config.json')]) {
                    echo 'Merged to integration'
                    echo "NODE ENV: ${NODE_ENV}"
                    echo 'Installing dependencies'
                    sh 'npm ci --legacy-peer-deps'

                    echo 'Building COSCRAD'
                    echo 'with node version'
                    sh 'node --version'

                    sh 'npm run build:coscrad:prod'

                    sh 'npx nx run api:build:cli'
            }
            }
                post {
                    success {
                        archiveArtifacts artifacts: 'dist/**, node_modules/**', followSymlinks: false
                    // Deploy front-end build to staging
                    sshPublisher(
                        publishers: [sshPublisherDesc(configName: 'coscradmin@staging.digiteched.com', transfers: [sshTransfer(cleanRemote: false, excludes: '', execCommand: 'rm -rf /var/www/html && mv build/dist/apps/coscrad-frontend /var/www/html && rm -rf build', execTimeout: 120000, flatten: false, makeEmptyDirs: false, noDefaultExcludes: false, patternSeparator: '[, ]+', remoteDirectory: 'build', remoteDirectorySDF: false, removePrefix: '', sourceFiles: 'dist/**')], usePromotionTimestamp: false, useWorkspaceInPromotion: false, verbose: false)])

                    // Deploy back-end build to staging
                    sshPublisher(
                        publishers: [sshPublisherDesc(configName: 'coscradmin@api.staging.digiteched.com', transfers: [sshTransfer(cleanRemote: false, excludes: '', execCommand: 'rm -rf archive ; mv build archive; touch archive/dist/apps/api/staging.env; PATH=$PATH://home/coscradmin/.nvm/versions/node/v18.16.0/bin pm2 restart main; echo API restarted', execTimeout: 120000, flatten: false, makeEmptyDirs: false, noDefaultExcludes: false, patternSeparator: '[, ]+', remoteDirectory: 'build', remoteDirectorySDF: false, removePrefix: '', sourceFiles: 'dist/**, node_modules/**')], usePromotionTimestamp: false, useWorkspaceInPromotion: false, verbose: false)])
                    }
                }
        }
    }
}

void copyConfig(String target) {
    /**
    * Note that the sample content config is actually valid for
    * our staging build.
    **/
    echo 'copying sample content config for test build'

    if (target == 'COSCRAD') {
        sh 'echo using SAMPLE.content.config as the COSCRAD front-end config'

        /* groovylint-disable-next-line LineLength */
        sh 'cp apps/coscrad-frontend/src/configurable-front-matter/data/content.config.SAMPLE.ts apps/coscrad-frontend/src/configurable-front-matter/data/content.config.ts'
        return
    }

    if (target == 'Haida') {
        sh 'echo sing Haida front-end content config'
        error 'No Haida content-config is specified in Jenkins'
        return
    }

    error "unsupported deployment target: ${target}"
}
