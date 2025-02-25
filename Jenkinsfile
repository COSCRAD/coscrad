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
                branch 'PR-*'
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

                    echo 'installing yarn'
                    sh 'npm i -g yarn'
                    echo 'yarn version'
                    sh 'yarn -v'
                    echo 'Installing dependencies'
                    sh 'yarn install --frozen-lockfile'

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

                    // See https://github.com/facebook/jest/issues/11354
                    sh "sed -i -e 's/const FORCE_EXIT_DELAY = 500;/const FORCE_EXIT_DELAY = 7000;/g' ./node_modules/jest-worker/build/base/BaseWorkerPool.js"

                    sh "cat ./node_modules/jest-worker/build/base/BaseWorkerPool.js | grep FORCE"

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
                branch 'integration'
            }
            stages {
                stage('install dependencies') {
                    steps {
                        echo 'Running staging build'
                        echo "NODE ENV: ${NODE_ENV}"
                        echo 'Installing dependencies'

                        echo 'installing yarn'
                        sh 'npm i -g yarn'
                        echo 'yarn version'
                        sh 'yarn -v'
                        echo 'Installing dependencies'
                        sh 'yarn install --frozen-lockfile'
                    }
                }
                stage('build front-end for COSCRAD sandbox') {
                    steps {
                        runFrontendBuild('COSCRAD')
                    }
                    post {
                        success {
                            deployFrontend('COSCRAD')
                        }
                    }
                }
                stage('build front-end for Haida sandbox') {
                    steps {
                        runFrontendBuild('Haida')
                    }
                    post {
                        success {
                            deployFrontend('Haida')
                        }
                    }
                }
                stage('build back-end') {
                    steps {
                        sh 'npx nx run build api --prod'
                    }
                    post {
                        success {
                            deployBackend()
                        }
                    }
                }
                stage('build cli') {
                    steps {
                        sh 'npx nx run api:build:cli'
                    }
                    post {
                        success {
                            deployCli()
                        }
                    }
                }
            }
        }
    }
}

/**
* TODO We might be able to have a single function that switches on `target` and
* sets several global variables to be used in various steps.
*/
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
            sh 'npx nx build coscrad-frontend --prod --skip-nx-cache'

            echo 'build contents'
            sh 'ls dist/apps'
                    }
}

String getDeploymentDirectoryForFrontendBuild(String target) {
    if (target == 'COSCRAD') {
        return 'html'
    }

    if (target == 'Haida') {
        return 'haida'
    }

    error "No deployment directory found for unknown build target: ${target}"

    return ''
}

void publishArtifacts(String sshConfigName,  \
    String postTransferCommand, \
    String remoteDirectory, \
    String sourceFilePattern) {
    sshPublisher(
        publishers: [
            sshPublisherDesc(
                configName: sshConfigName,
                transfers: [
                    sshTransfer(
                        cleanRemote: false,
                        excludes: '',
                        execCommand: postTransferCommand,
                        execTimeout: 120000,
                        flatten: false, makeEmptyDirs:
                        false, noDefaultExcludes: false,
                        patternSeparator: '[, ]+',
                        remoteDirectory: remoteDirectory,
                        remoteDirectorySDF: false,
                        removePrefix: '',
                        sourceFiles: sourceFilePattern
                        )],
                    usePromotionTimestamp: false,
                    useWorkspaceInPromotion: false,
                    verbose: false
                    )])
    }

void archiveArtifacts(String sourceFilePattern) {
    archiveArtifacts artifacts: sourceFilePattern, followSymlinks: false
}

void deployFrontend(String target) {
    String basePath = '/var/www/'

    String deploymentDirectory = getDeploymentDirectoryForFrontendBuild(target)

    String fullDeploymentPath = "${basePath}${deploymentDirectory}"

    String command = "rm -rf ${fullDeploymentPath} \
     && mv build/dist/apps/coscrad-frontend \
      ${fullDeploymentPath} && rm -rf build "

    String sourceFilePattern = 'dist/apps/coscrad-frontend/**'

    archiveArtifacts(sourceFilePattern)

    publishArtifacts('coscradmin@staging.digiteched.com', command, 'build', sourceFilePattern)
}

void deployBackend() {
    String backendArtifactsPattern = 'dist/apps/api/**, node_modules/**'

    String postDeployCommand = 'rm -rf archive ; \
        mv build archive; \
        touch archive/dist/apps/api/staging.env; \
        PATH=$PATH://home/coscradmin/.nvm/versions/node/v18.16.0/bin pm2 restart main; \
        echo API restarted'

    archiveArtifacts(backendArtifactsPattern)

    publishArtifacts('coscradmin@api.staging.digiteched.com',
    postDeployCommand, \
    'build', \
    backendArtifactsPattern)
}

void deployCli() {
    String backendArtifactsPattern = 'dist/apps/coscrad-cli/**'

    String postDeployCommand = 'echo CLI build copied'

    archiveArtifacts(backendArtifactsPattern)

    publishArtifacts('coscradmin@api.staging.digiteched.com',
    postDeployCommand, \
    'cli', \
    backendArtifactsPattern)
}
