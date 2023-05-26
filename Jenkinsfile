/* groovylint-disable NestedBlockDepth */
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
                expression { return false }
            // TODO Add me back
            // branch 'PR-*'
            }
            steps {
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
        stage('build and deploy to staging') {
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
                branch 'PR-*'
            // TODO Add me back
            // branch 'integration'
            }

                    // TODO Put this back
                // post {
                    // success {
                    //     archiveArtifacts artifacts: 'dist/**, node_modules/**', followSymlinks: false
                    // // Deploy front-end build to staging
                    // sshPublisher(
                    //     publishers: [sshPublisherDesc(configName: 'coscradmin@staging.digiteched.com', transfers: [sshTransfer(cleanRemote: false, excludes: '', execCommand: 'rm -rf /var/www/html && mv build/dist/apps/coscrad-frontend /var/www/html && rm -rf build', execTimeout: 120000, flatten: false, makeEmptyDirs: false, noDefaultExcludes: false, patternSeparator: '[, ]+', remoteDirectory: 'build', remoteDirectorySDF: false, removePrefix: '', sourceFiles: 'dist/**')], usePromotionTimestamp: false, useWorkspaceInPromotion: false, verbose: false)])

            // // Deploy back-end build to staging
            // sshPublisher(
            //     publishers: [sshPublisherDesc(configName: 'coscradmin@api.staging.digiteched.com', transfers: [sshTransfer(cleanRemote: false, excludes: '', execCommand: 'rm -rf archive ; mv build archive; touch archive/dist/apps/api/staging.env; PATH=$PATH://home/coscradmin/.nvm/versions/node/v18.16.0/bin pm2 restart main; echo API restarted', execTimeout: 120000, flatten: false, makeEmptyDirs: false, noDefaultExcludes: false, patternSeparator: '[, ]+', remoteDirectory: 'build', remoteDirectorySDF: false, removePrefix: '', sourceFiles: 'dist/**, node_modules/**')], usePromotionTimestamp: false, useWorkspaceInPromotion: false, verbose: false)])
            // }
            // }
            stages {
                stage('install dependencies') {
                    steps {
                        echo 'Running staging build'
                        echo "NODE ENV: ${NODE_ENV}"
                        echo 'Installing dependencies'
                        sh 'npm ci --legacy-peer-deps'
                    }
                }
                stage('build front-end') {
                    steps {
                        runFrontendBuild('COSCRAD')
                    }
                    post {
                        success {
                            archiveArtifacts artifacts: 'dist/**', followSymlinks: false

                            sshPublisher(
                        publishers: [sshPublisherDesc(configName: 'coscradmin@staging.digiteched.com', transfers: [sshTransfer(cleanRemote: false, excludes: '', execCommand: 'rm -rf /var/www/html && mv build/dist/apps/coscrad-frontend /var/www/html && rm -rf build ', execTimeout: 120000, flatten: false, makeEmptyDirs: false, noDefaultExcludes: false, patternSeparator: '[, ]+', remoteDirectory: 'build', remoteDirectorySDF: false, removePrefix: '', sourceFiles: 'dist/apps/coscrad-frontend/**')], usePromotionTimestamp: false, useWorkspaceInPromotion: false, verbose: false)])
                        }
                    }
                }
                stage('build back-end') {
                    steps {
                        sh 'npx nx run build api --prod'
                    }
                }
                stage('build cli') {
                    steps {
                        sh 'npx nx run api:build:cli'
                    }
                }
            }
        }
    }
}

String getContentConfigFilename(String target) {
    if (target == 'COSCRAD') { return 'content.config.SAMPLE.ts' }

    if (target == 'Haida') { return 'content.config.STAGING.ts' }

    error "unsupported deployment target: ${target}"

    // This is to satisfy the linter. Maybe we should be explicitly throwing in the line above?
    return ''
}

/**
* # Available Targets
 - COSCRAD
 - Haida
**/
void copyContentConfig(String target) {
    String contentConfigDirectory = 'apps/coscrad-frontend/src/configurable-front-matter/data/'

    /**
    * Note that the sample content config is actually valid for
    * our staging build.
    **/
    echo "attempting to copy sample content config for test build for target ${target}"

    /* groovylint-disable-next-line LineLength */
    sh "cp ${contentConfigDirectory}${getContentConfigFilename(target)} ${contentConfigDirectory}content.config.ts"

    return
}

void runFrontendBuild(String target) {
    configFileProvider([configFile(fileId:'staging.auth.config',  \
                    targetLocation: 'apps/coscrad-frontend/src/auth_config.json')]) {
            echo "Building COSCRAD front-end for target project: ${target}"
            echo 'with node version'
            sh 'node --version'

            copyContentConfig(target)
            sh 'npx nx build coscrad-frontend --prod'

            echo 'build contents'
            sh 'ls dist/apps'
                    }
}

// 'rm -rf /var/www/html && mv build/apps/coscrad-frontend /var/www/html && rm -rf build'
