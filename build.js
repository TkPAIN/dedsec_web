const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const archiver = require('archiver');

console.log('⎈ DEDSEC BUILDER - Iniciando proceso...');

// 1. Limpiar builds anteriores
async function clean() {
    console.log('🧹 Limpiando builds anteriores...');
    await fs.remove('./dist');
    await fs.remove('./website/downloads');
    await fs.ensureDir('./website/downloads');
}

// 2. Copiar web a app desktop
async function buildDesktop() {
    console.log('💻 Construyendo app desktop...');
    process.chdir('./desktop-app');
    try {
        execSync('npm install', { stdio: 'inherit' });
        execSync('npm run build-all', { stdio: 'inherit' });
        // Copiar ejecutables a la carpeta de descargas
        await fs.copy('./dist', '../website/downloads/desktop');
        console.log('✅ Desktop apps generadas');
    } catch (error) {
        console.error('❌ Error en build desktop:', error);
    }
    process.chdir('..');
}

// 3. Construir app móvil
async function buildMobile() {
    console.log('📱 Construyendo app móvil...');
    process.chdir('./mobile-app');
    try {
        execSync('npm install', { stdio: 'inherit' });
        execSync('npm run build-apk', { stdio: 'inherit' });
        console.log('✅ APK generada');
    } catch (error) {
        console.error('❌ Error en build mobile:', error);
    }
    process.chdir('..');
}

// 4. Generar página de descargas dinámica
async function generateDownloadPage() {
    console.log('📄 Generando página de descargas...');
    const downloadHtml = await fs.readFile('./website/download.html', 'utf8');
    // Aquí podrías inyectar versiones reales
    await fs.writeFile('./website/download.html', downloadHtml);
}

// 5. Empaquetar todo para distribución
async function packageRelease() {
    console.log('📦 Empaquetando release...');
    const output = fs.createWriteStream('./dist/dedsec-release.zip');
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    output.on('close', () => {
        console.log(`✅ Release empaquetado: ${archive.pointer()} bytes`);
    });
    
    archive.pipe(output);
    archive.directory('./website', 'dedsec-website');
    archive.finalize();
}

// Ejecutar todo
async function build() {
    await clean();
    await buildDesktop();
    await buildMobile();
    await generateDownloadPage();
    await packageRelease();
    console.log('⎈ BUILD COMPLETADO - #DespertarColectivo');
}

build().catch(console.error);
