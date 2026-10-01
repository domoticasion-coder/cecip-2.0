import fs from 'fs';
import path from 'path';

const csvRaw = `25 DE JUNIO S.A\tESTACIÓN DE SERVICIO\t25dejunio@arnet.com.ar\t343 4314448\t25 de Junio 201, Paraná\t1960\tESTACION DE SERVICIO
A TODO COLOR PINTURERIA\tPINTURERIA\tatc9@atodocolor.com.ar\t343 500-0956\tAv. Almafuerte 175, Paraná\t2611\tPinturería Zurdo
ABERTURAS VALENTINUZ S.A\tMETALURGICA\tagariboglio@valentinuz.com.ar\t343 4261718\tA. Salellas, R. Sanz (Parque Industrial)\t2075\tMetalúrgica
AGROLAC PARANÁ\tSUMINISTRO Y FABRICACIÓN DE ALIMENTOS\tcontacto@agrolacparana.com.ar\t3434151319\tAv. Almafuerte 3283, Paraná\t2922\tAlimentos
AGUA COTTI\tAGUA ENVASADA, DISPENSER\tcontacto.aguacotti@gmail.com\t343 5037980\tAv. P. Zanni 1449, Paraná\t2725\tBebidas y Envasados
AGUA DE MESA FRESK\tAGUA ENVASADA DISPENSER\taguademesafresk@hotmail.com\t343 4363660\tProf.ª Joséfina Bressoud 2335, Paraná\t2829\tBebidas y Envasados
AGUA MARINA S.R.L\tAGUA ENVASADA DISPENSER\taguamadmi@gmail.com\t343 503-3205\tZuviría 1612, Paraná\t3062\tBebidas y Envasados
AGUA NUESTRA\tAGUA ENVASADA DISPENSER\tpedidos@aguanuestra.com.ar\t343 622-1000\tValentín Torra 5633, Paraná\t2750\tBebidas y Envasados
ALFREDO CALABRESE\tSERVICIOS CONTABLES\tinfo@estudiocalabrese.com.ar\t343 5117189\tGobernador Solá 687, Paraná\t2417\tEstudio Contable
ALPINA S.A\tCARPINTERIA\tmarcelo@escalerasalpina.com.ar\t0343 436-5451\tRoque Sáenz Peña, Paraná\t2713\tEscaleras y Carpintería
ALSUR BAZAR\tBAZAR\talsur-casajardin@hotmail.com\t343 6232123\tAv. de las Américas 4694, Paraná\t3223\tBazar y Casa Jardín
AMERICAN E.I. JUAN PABLO GÓMEZ\tEDUCACIÓN / ENSEÑANZA\tamerican.english.inst.online@gmail.com\t343 513-7638\tGral. Manuel Belgrano 179, Paraná\t3250\tInstituto de Inglés
AMUPRO ASOCIACIÓN MUTUAL\tSALUD / MUTUAL\tadministracion@amupro.com.ar\t343 5246165\tEnrique Carbó 267, Paraná\t2755\tSalud y Mutual
ANGEL HUMBERTO BELLONI S.R.L\tDISTRIBUIDORA\tmonicabelloni720@hotmail.com\t343 4246564\tBartolomé Zapata 1040, Paraná\t2563\tDistribuidora
ANVOI S.A\tSERVICIO DE LIMPIEZA\tfollocco@anvoidistribuciones.com.ar\t343 438-3002\tEnrique Carbó 778, Paraná\t3249\tLimpieza e Insumos
APASER\tSEGUROS\tinfo@apaser.com.ar\t343 4075732\tAv. Francisco Ramírez 1841, Paraná\t2423\tAsociación Productores Asesores
ARCO IRIS\tMATERIALES ELECTRICOS\tarcoirisparana@gmail.com\t343 5036430\tBernardo O'Higgins 795, Paraná\t722\tMateriales Eléctricos
ARENERA FARJAT\tMATERIALES DE CONSTRUCCION\tarenerafarjat@hotmail.com\t343 4216738\tAv. José Manuel Estrada, Paraná\t2690\tArenera y Construcción
ARENERA TOMA NUEVA S.R.L\tMATERIALES DE CONSTRUCCION\tareneratomanuevasrl@hotmail.com\t343 404-5921\tRondeau al final, Paraná\t2888\tArenera y Construcción
ASCENSORES DEL RÍO\tASCENSORES\tascensores_delrio@hotmail.com\t343 503-2795\tLa Paz 533, Paraná\t3002\tMantenimiento Ascensores
BAMBÚ DREWANZ\tINDUMENTARIA\tbambuparana@hotmail.com\t343 4641745\t25 de Junio 12, Paraná\t2896\tIndumentaria
BANCO BICA\tBANCO Y FINANCIERA\tmarisa.romanatti@bica.com.ar\t343 4318547\t25 de Mayo 182, Paraná\t2544\tEntidad Bancaria
BANCO ICBC\tBANCO Y FINANCIERA\tcontacto@icbc.com.ar\t343 4200000\tPellegrini 42, Paraná\t2600\tEntidad Bancaria
BANCO NACIÓN\tBANCO Y FINANCIERA\t2650adm@bna.com.ar\t343 4212039\tGral. José de San Martín 1000, Paraná\t1353\tEntidad Bancaria
BASA WORLD TRAVEL\tAGENCIA DE VIAJES\tlorenabasa@basaworldtravel.com.ar\t343 446-3078\tPellegrini 80, Paraná\t2607\tTurismo y Viajes
BENVENUTO Y ZANNI S.R.L\tINMOBILIARIA\tadministracion@benvenutoyzanni.com.ar\t343 4520520\tUruguay 218, Paraná\t1264\tServicios Inmobiliarios
BLACK BALEY DEPORTES\tCASA DE DEPORTES\tventas@blackbaley.com\t343 543-2865\tUruguay 156, Paraná\t3142\tArtículos Deportivos
BOLSA DE COMERCIO E.R\tFINANCIERA / BURSATIL\tsecretaria@bcer.com.ar\t343 468-0180\tCervantes 190, Paraná\t2110\tBolsa de Comercio
BRONDI MAQUINARIAS\tMAQUINARIA AGRICOLA\tventas@brondimaquinarias.com.ar\t343 4655014\tAv. Almafuerte 998, Paraná\t1343\tMaquinaria Agrícola
BUFFY'S ICE CREAM\tHELADERIA / GASTRONOMIA\tbuffysparana@gmail.com\t343 5100000\tCorrientes 687 (Shopping), Paraná\t3246\tHeladería
C.D EDGARDO GRECA S.A\tMATERIALES DE CONSTRUCCION\tadministracion@greca.com.ar\t343 5440512\tAv. de las Américas 3542, Paraná\t2850\tMateriales y Corralón
CALZADOS BARBARO\tCALZADO Y VESTIMENTA\tcalzadosbarbaro@live.com.ar\t343 620-7131\tProvincias Unidas 607, Paraná\t2941\tZapatería
CALZADOS BETER\tCALZADO Y VESTIMENTA\tinfo@calzadosbeter.com.ar\t343 4163622\tGral. José de San Martín 1124, Paraná\t22\tZapatería
CALZADOS PRIVILEGE GABRIEL FOUINE S.R.L\tCALZADO Y VESTIMENTA\tcalzadosprivilage@hotmail.com\t343 4706768\tGral. José de San Martín 1005, Paraná\t2156\tZapatería
CÁMARA DE ESTACIÓN DE COMBUSTIBLE E.R (CECAER)\tORGANIZACION GREMIAL\tcecaer@cecaer.com.ar\t343 5366968\tGualeguaychú 544, Paraná\t2001\tCámara Estaciones de Servicio
CÁMARA DE LA PROPIEDAD HORIZONTAL\tCORREDOR INMOBILIARIO\tcpihectorcejas@gmail.com\t343 466-9586\tRosario del Tala 417, Paraná\t3227\tCámara Inmobiliaria
CARAMAGNA INMOBILIARIA\tINMOBILIARIA\tvickycaramagna73@gmail.com\t343 4312603\tGral. Justo José de Urquiza 201, Paraná\t2494\tInmobiliaria
CAROLA INDUMENTARIA FEMENINA\tINDUMENTARIA\tdaaia.b@hotmail.com\t343 520-5372\tMonte Caseros 189, Paraná\t3158\tModa e Indumentaria
CARPINTERIA EL OSO\tCARPINTERIA\tcieloso2000@hotmail.com\t343 533-2628\tAv. Francisco Ramírez 3930, Paraná\t3097\tCarpintería y Maderas
CASA DEL MESTRE S.R.L\tALFOMBRAS Y TELAS\tventas@casdelmestre.com.ar\t343 6235776\t25 de Junio 20, Paraná\t100\tTelas y Alfombras
CASA FONTANA S.R.L\tFABRICA DE COLCHONES\tfabricafontana@hotmail.com\t343 5174759\tAv. Jorge Newbery 2349, Paraná\t2793\tColchones y Sommiers
CASA LUIS CHEMES S.R.L\tBAZAR Y ELECTRO\tsilvinasaliva@chemesweb.com.ar\t343 6121356\tCorrientes 210, Paraná\t2500\tBazar y Hogar
CELESTE ORTIZ\tJUGUETERIA\talilesce@gmail.com\t343 610-0497\tZeballos, Paraná\t3020\tJuguetería
CENTRO DE LA CONSTRUCCION EN SECO SAS\tMATERIALES DE CONSTRUCCION\tadministracion@construseco.com.ar\t343 454-7500\tSalvador Maciá 161, Paraná\t2847\tDrywall y Construcción
CERAMICOS PELLEGRINI S.R.L\tMATERIALES DE CONSTRUCCION\tadministracion@ceramicospellegrini.com.ar\t343 5046205\tGral. Pascual Echagüe 735, Paraná\t1931\tCerámicos y Pisos
CERINI Y PACHER S.A\tDISTRIBUIDORA COMESTIBLES\tandres_cerini@hotmail.com\t343 447-8922\tPedro Seguí 810, Paraná\t80\tMayorista Alimentos
CHAPINO REPUESTOS\tREPUESTOS AUTOMOTOR\tchapinorepuestos@hotmail.com\t343 446-8819\tAv. de las Américas Km 4, Paraná\t2687\tRepuestos
CHARLY COTILLÓN\tCOTILLON\tlucianazapata1@hotmail.com\t343 6101886\tGualeguaychú 880, Paraná\t3225\tCotillón y Eventos
CHEZ LE SAC\tINDUMENTARIA\toficinachezlesac@hotmail.com\t343 4220858\tGral. José de San Martín 1097, Paraná\t688\tIndumentaria y Marroquinería
CÍA ENTRERRIANA DE RODAMIENTOS S.A\tRODAMIENTOS E INDUSTRIA\tinfo@rodacom.com.ar\t343 4557552\tAv. Almafuerte 201, Paraná\t3138\tRodamientos e Insumos
CIMES EMBOTELLADORA DE ENTRE RIOS\tEMBOTELLADORA\tcimes.embotelladora@gmail.com\t343 4523885\tFrancia 1786, Paraná\t3252\tEmbotelladora de Agua
CIPAR INGENIERIA\tEQUIPAMIENTO MEDICO\tleticiamujica@ciparingenieria.com.ar\t343 451-8376\tGral. José de San Martín 1217, Paraná\t3091\tEquipamiento Médico
CLÍNICA MODELO\tSALUD\tcontaduria@clinicamodelosa.com.ar\t343 5147439\tGral. José de San Martín 1238, Paraná\t398\tClínica y Sanatorio
CMS S.A - FERRETERIA INDUSTRIAL\tFERRETERIA INDUSTRIAL\tinfo@ferrenet.net\t343 4344344\tDean J. Álvarez 262, Paraná\t2760\tFerretería Industrial
COLECCION DE AROMAS\tFRAGANCIAS Y BAZAR\tbycolecciondearomas@gmail.com\t343 474-2001\tParaná Centro\t3242\tPerfumería y Fragancias
CONFORT INGENIERIA S.A\tCLIMATIZACION E INGENIERIA\tinfo@confortingenieria.com\t343 4729426\tAv. Ejército 1366, Paraná\t2962\tAire Acondicionado y Climatización
CONSULTORIA COLL ARECO\tCONSULTORIA Y PATENTES\tpatentes@collareco.com\t11 50396348\tAdolfo Alsina 971, Paraná\t2019\tPropiedad Intelectual
CONTACTO PUBLICITARIOS\tPUBLICIDAD Y COMUNICACION\tpublicidadcmg@hotmail.com\t343 633-7237\tAv. Jorge Newbery 19, Paraná\t3087\tPublicidad
COOPERATIVA FARMACEUTICA DEL LITORAL\tDROGUERIA\tinformacion@drogueriadellitoral.com\t343 404-1891\tEspaña 138 - 150, Paraná\t2706\tDroguería Mayorista
CORRALON RONDEAU\tMATERIALES DE CONSTRUCCION\tcristian.grecca@corralonrondeau.com.ar\t343 472-9713\tRondeau 899, Paraná\t2657\tCorralón
CORRER S.A\tLOGISTICA Y DISTRIBUCION\tadministracion@corrersa.com\t343 429-0693\tVillaguay 1025, Paraná\t2898\tCorreo y Logística
COTILLON MAKUKOS\tCOTILLON\tmiguel@cotillonmakukos.com.ar\t343 440-2618\tAv. P. Zanni 1402, Paraná\t2808\tCotillón
COUDENHOVE E HIJOS\tSERVICIOS INFORMATICOS\trubencoudenhove@hotmail.com\t343 4312500\tAv. Don Bosco 117, Paraná\t2873\tInformática y Sistemas
CREACIONES PARTY\tCONFECCION DE UNIFORMES\tcreacionespatry@yahoo.com.ar\t343 431-6017\t25 de Junio 249, Paraná\t2814\tUniformes y Textil
DANIEL ALBERTO PEDERZOLLI\tNEUMATICOS Y MECANICA\tcasapeder@hotmail.com\t343 4295397\tAv. Almafuerte 1411, Paraná\t958\tNeumáticos
DELLA SCHIAVA S.A\tDISTRIBUIDORA COMESTIBLES\tdellaschiavasaparana@gmail.com\t343 405-2512\tAv. Almafuerte 2792, Paraná\t3074\tDistribuidora Alimentos
DEPOR JEANS\tINDUMENTARIA\tpagos@deporjeans.com\t343 4220000\tGral. José de San Martín 770, Paraná\t2370\tIndumentaria Deportiva
DEYVEL ABERTURAS S.R.L\tMETALURGICA Y ABERTURAS\tventas@deyvel.com.ar\t343 621-1616\tGral. Gervasio Artigas 745, Paraná\t2827\tAberturas
DIFLER CONSUMAX S.A\tFINANCIERA\tguillermo@consumax.com.ar\t343 6154525\tGral. Justo José de Urquiza 1031, Paraná\t2967\tTarjeta de Crédito y Préstamos
DINASTIA CALZADO\tCALZADO Y VESTIMENTA\tdinastiaalem@gmail.com\t343 4164340\tVenezuela 154, Paraná\t2951\tCalzados
DISTRIBUCIONES PARANÁ\tCOSMETICA Y PERFUMERIA\tdistribucioness.parana@gmail.com\t343 453-9075\tParaná Centro\t3244\tCosmética
DISTRIBUIDORA GARAY\tDISTRIBUIDORA DE BEBIDAS\tcentral@garaydistribuciones.com\t343 455-7799\tBuenos Aires 481, Paraná\t2900\tDistribuidora Bebidas
DISTRIBUIDORA GUADALUPE S.A\tDISTRIBUIDORA MAYORISTA\tguadalupe.parana@gmail.com\t343 4678108\tAv. de las Américas 3935, Paraná\t2442\tDistribuidora
DISTRIMAX\tUNIFORMES E INDUMENTARIA\tventas@distrimax.com.ar\t343 460-5135\tPanamá 630, Paraná\t3237\tRopa de Trabajo
DRUGSTORE PLAZA\tKIOSCO Y GOLOSINAS\tdrugstoreplaza@hotmail.com\t343 4594641\tEspaña 27, Paraná\t3188\tKiosco 24hs
ECO DISEÑO PARANA\tMUEBLERIA Y CARPINTERIA\tecodiseniopna@gmail.com\t343 4666092\tRío Negro 842, Paraná\t3221\tDiseño y Muebles
EL COMBOYANO FUMIGACIONES\tCONTROL DE PLAGAS\triosrubene@hotmail.com\t343 4622152\tPres. Juan Domingo Perón 461, Paraná\t3150\tFumigaciones
EL CONSTRUCTOR MATERIALES\tMATERIALES DE CONSTRUCCION\telconstructor1070@gmail.com\t343 5411341\tAv. Francisco Ramírez 1070, Paraná\t3228\tMateriales Construcción
EL CUNUMI AUTOSERVICIO\tSUPERMERCADO\tpromero_arg@yahoo.com.ar\t343 4330791\tGdor. Manuel Crespo 1223, Paraná\t2632\tAutoservicio
EL EMPALME S.R.L\tESTACION DE SERVICIO\telempalmesrl@gmail.com\t343 534-8592\tRuta 12 Km 4, Paraná\t2718\tCombustibles YPF
EL EMPORIO DE LA LANA\tTEXTIL Y LANAS\taliciavolpe@gigared.com\t343 4512922\tDean J. Álvarez 274, Paraná\t556\tLanas y Tejidos
EL PALACIO DEL BOTON S.R.L\tMERCERIA\telpalaciodelbotonsrl.adm@gmail.com\t343 522-7483\tMonte Caseros 197, Paraná\t3204\tMercería
EL RUTERO S.R.L\tESTACION DE SERVICIO\telruteroypf@gmail.com\t343 6204899\tAv. de las Américas 3106, Paraná\t748\tEstación de Servicio
EL SUPER DE LA CONSTRUCCION\tMATERIALES DE CONSTRUCCION\telsuperdelaconstruccion@gmail.com\t343 4685013\tAv. P. Zanni 2315, Paraná\t2703\tConstrucción
ELESE SOLUCIONES TECNOLOGICAS S.R.L\tTECNOLOGIA Y SISTEMAS\tadministracion@v-elese.com.ar\t343 438-9136\tAv. Almafuerte 4194, Paraná\t2816\tSoluciones IT
EMPORIO DE LA MADERA S.R.L\tMADERERA\tventas@emperiodelamaderasrl.com.ar\t343 4287256\tRondeau 500, Paraná\t2045\tMaderas y Tableros
ENTRE RÍOS COLCHONES\tMUEBLERIA Y COLCHONES\tmarianajozami@gmail.com\t343 425-5414\tPerú 64, Paraná\t2200\tColchones y Muebles
ENVASER HNOS\tENVASES PLASTICOS\tclaudioenvaser@hotmail.com\t343 6213958\tAv. Almafuerte 1321, Paraná\t2916\tEnvases y Polietileno
ESCO S.A DE CAPITAL Y AHORRO\tFINANCIERA / PLANES\tfatimamachuca@esco.com.ar\t343 4840200\tGualeguaychú 763, Paraná\t2566\tPlanes de Ahorro
ESCOBAR SANTA FE S.A.C.I.F.I\tCONCESIONARIA DE AUTOS\tptorres@escobarstafe.com.ar\t343 4240799\tAv. Almafuerte 1140, Paraná\t2757\tVenta de Automotores
ESPACIO BA\tINDUMENTARIA\tlocalesespacioba@gmail.com\t3455 49-5966\tGral. José de San Martín 886, Paraná\t3161\tIndumentaria
ESTACIÓN DE SERVICIOS LAURENCENA\tESTACION DE SERVICIO\tadministracion@grupodipalma.org\t343 438-1873\tAv. Laurencena 98, Paraná\t3239\tEstación de Servicio
ESTEBAN ENRIQUE\tEMPRENDEDOR\testeban_augusto_enrique@hotmail.com\t343 622-9156\tJosé I. Vera 1140, Paraná\t3129\tEmprendimiento
ETCHEVEHERE RURAL S.R.L\tINMOBILIARIA RURAL\tinfo@etchevehere-rural.com.ar\t343 4230177\tGral. Justo José de Urquiza 814, Paraná\t2260\tInmobiliaria y Remates
EVENTOS PARANÁ EYP S.R.L\tALQUILER EVENTOS\tgerenciaeypsrl@gmail.com\t343 404-2597\tJuan B. Justo 407, Paraná\t2821\tCarpas y Baños Químicos
FARMACIA RIVADAVIA S.R.L\tFARMACIA Y SALUD\tfririvadavia38@gmail.com\t343 428-4371\tAlameda de la Federación 399, Paraná\t2932\tFarmacia
FARMACIA VILLEGAS\tFARMACIA Y SALUD\tcontacto@farmaciavillegas.com.ar\t343 5096726\tAv. Don Bosco 1505, Paraná\t2818\tFarmacia
FELLER S.R.L (GRUPO MOTTA)\tAVICULTURA / AGRO\tfeller@grupomotta.com\t343 4876065\tEstación General Racedo, Entre Ríos\t2521\tProducción Avícola
FENIX DISTRIBUCIONES S.R.L\tDISTRIBUIDORA ALIMENTOS\tfenixdistribuciones1@gmail.com\t343 524-0075\tAv. de las Américas 5327, Paraná\t3197\tAlimentos y Bebidas
FIAT RITMO\tREPUESTOS AUTOMOTOR\tfiatritmoparana@yahoo.com.ar\t343 425-2245\tAv. Francisco Ramírez 2571, Paraná\t2770\tRepuestos Fiat
FINAN-YA\tFINANCIERA\tfinanya-parana@finanya.com.ar\t3492 69-1220\tPellegrini 220, Paraná\t2711\tCréditos y Préstamos
FIORELLA PERESUTTI\tBIJOUTERIE Y DIETETICA\tfiorellaperesutti@gmail.com\t343 468-6703\tFeliciano 422, Paraná\t3248\tDietética y Accesorios
FLR CONTROL DE PLAGAS\tCONTROL DE PLAGAS\tfumigacioneslarioja@hotmail.com\t343 416-1651\tPablo Lorentz 2954, Paraná\t3243\tFumigaciones
FRIO LITORAL\tREFRIGERACION\tfriolitoralparana@hotmail.com\t343 406-6623\tAyacucho 606, Paraná\t2763\tEquipamiento Comercial
GARABATOS\tINDUMENTARIA INFANTIL\tclotapna@hotmail.com\t343 4671530\t25 de Junio 51, Paraná\t3182\tRopa Niños
GIGARED S.A\tTELECOMUNICACIONES\tefernandez@gigared.com\t343 4074442\tGualeguaychú 800, Paraná\t2664\tInternet y Cable
GIUS LEGAL\tSERVICIOS JURIDICOS\tgiuslegal@gmail.com\t343 5313635\tCórdoba 389, Paraná\t3255\tPropiedad Intelectual
GRAVAFILT S.A\tMATERIALES DE CONSTRUCCION\tinfo@gravafilt.com.ar\t343 405-2113\tCamino Santiago y Gordillo, Paraná\t2088\tGravas y Áridos
HAIMOVICH S.A\tCONCESIONARIA DE AUTOS\tgerencia@haimovich.com.ar\t343 5192781\tGualeguaychú 540, Paraná\t163\tConcesionaria Toyota y VW
HERRAJES YORI Y CÍA S.A\tHERRAJES Y FERRETERIA\tasministracion@herrajesyori.com.ar\t343 300-1905\tEnrique Carbó 906, Paraná\t2867\tHerrajes
HERRERIA LODOLO\tHERRERIA\therrerialodolo@gmail.com\t343 4669447\tVilla San Benito 1175, San Benito\t3115\tHerrería de Obra
HERRLEIN DISTRIBUIDORA S.R.L\tDISTRIBUIDORA\tmariofalico@hotmail.com\t343 450895\tRosario Vera Peñaloza, Paraná\t3093\tDistribuidora
HIELO EL POLO\tFABRICA DE HIELO\tsonletkren@yahoo.com.ar\t343 4219976\tParaná\t2901\tHielo en Barra y Rolito
HOJMAN NEGOCIOS INMOBILIARIOS\tINMOBILIARIA\tsaul@hojman.net\t343 4155121\tCervantes 150, Paraná\t2994\tServicios Inmobiliarios
HUEVO CAMPO S.R.L\tPRODUCCION ALIMENTOS\tinfo@rothsrl.com.ar\t343 4244463\tDean J. Álvarez 202, Paraná\t2700\tHuevos y Derivados
ILUMINAR S.H\tILUMINACION Y ELECTRICIDAD\tiluminar.cesar@gmail.com\t343 4218221\tAyacucho 1060, Paraná\t2831\tLuminarias LED
IMPERTODO PINTURERIA\tPINTURERIA E IMPERMEABILIZACION\timpertodopinturerias@gmail.com\t343 505-6806\tAv. de las Américas 2825, Paraná\t2688\tPinturas
IMPRENTA IMPRESIT S.R.L\tIMPRENTA Y GRAFICA\timpresit@hotmail.com\t343 4386692\tFeliciano 287, Paraná\t2815\tArtes Gráficas
INMOBILIARIA ARMANDOLA\tINMOBILIARIA\tarmandolajm@jmarmandola.com.ar\t343 5101135\tAndrés Pazos 700, Paraná\t2092\tInmobiliaria
INSTITUTO AUTARTICO PROVINCIAL DEL SEGURO (IAPSER)\tSEGUROS\tpresidencia@institutoseguro.com.ar\t343 460-9202\tGral. José de San Martín 918, Paraná\t1533\tCompañía de Seguros
INSTITUTO NEW STAR\tEDUCACION\tinstituto@newstart.edu.ar\t343 4555142\tUrquiza 11063, Paraná\t2743\tInstituto Educativo
INTI SPORT\tINDUMENTARIA DEPORTIVA\tsolnatividadpatat@gmail.com\t343 621-7999\tAv. San Martín 174, Col. Avellaneda\t3240\tDeportes
ITA S.A\tACERO Y METALURGICA\tacerositasa@acerositasa.com\t3464 69-4858\tAntonio Salellas 1391, Paraná\t1975\tAcero e Industria
JAZMIN CRESPO INMOBILIARIA (SISTEMA CONFIAR)\tINMOBILIARIA Y COMUNICACION\tsecretariaoficinafh@gmail.com\t343 5037178\tAv. Belgrano, Crespo\t3253\tInmobiliaria y Medios
JIMENA CAFFARO\tMARKETING Y DISEÑO\tcaffarojimena@gmail.com\t343 513-5199\tParaná\t3251\tDiseño Gráfico y Marketing
JOHNSON ACERO PARANÁ\tAMOBLAMIENTOS Y ACERO\tinfo@johnsonacero.com\t343 4261000\tAv. Almafuerte 3658, Paraná\t1919\tCocinas y Amoblamientos
JOYERIA AURUM\tJOYERIA Y RELOJERIA\taurum.joyeria@gmail.com\t343 463-7878\tGral. José de San Martín 1090, Paraná\t3153\tJoyería y Relojes
JOSE FOLMER E HIJOS S.A\tMAQUINARIA AGRICOLA\tinfo@folmer.com.ar\t343 501-8597\tCrespo / Paraná\t717\tConcesionaria Maquinarias
JOYERIA RUBI S.A\tJOYERIA Y RELOJERIA\ttallerrelrubi@hotmail.com\t342 6132030\tGral. José de San Martín 902, Paraná\t2848\tJoyería
JOYERIA Y RELOJERIA LEVIN\tJOYERIA Y RELOJERIA\tnancisit@live.com\t343 472-8312\tPerú 130, Paraná\t3096\tJoyería
JYH DISTRIBUCIONES\tDISTRIBUIDORA BEBIDAS\tguijai@hotmail.com\t343 4633003\tAv. Almafuerte 3794, Paraná\t2194\tDistribuidora Cervecería
LA AGRICOLA REGIONAL\tCOOPERATIVA AGROPECUARIA\tjuans@laagricolaregional.com.ar\t343 438-2700\tGualeguaychú 880, Paraná\t2824\tCooperativa Agropecuaria
LA BIANCA S.R.L\tFABRICA DE PASTAS\tlabianca@gamma.com.ar\t343 5437382\tSantiago Derqui 564, Paraná\t1195\tPastas Frescas
LA ESPIGA DE ORO S.R.L\tPANADERIA\tlaespigadeorosrl_adm@hotmail.com\t343 5175900\tNarciso Laprida 301, Paraná\t2738\tPanadería y Confitería
LA PERUANA S.R.L\tCOMESTIBLES Y MINORISTA\tpagos@laperuanasrl\t343 5075991\tAv. Francisco Ramírez 2134, Paraná\t1127\tAlmacén Comestibles
LA UNIÓN S.A\tTALLER MECANICO DIESEL\tlaunionsa@yahoo.com\t343 457-2028\tPedro A. Aranguren, Paraná\t2780\tMecánica Diesel
LAMPERTTI Y CÍA S.R.L\tSERVICIOS FUNEBRES\tadministracion@lampertti.com.ar\t343 4236804\tLeandro N. Alem 436, Paraná\t2453\tServicios Sociales
LAPORTA GABRIEL EDUARDO\tVENTA DE AUTOS\tgabre22@hotmail.com\t343 504-5278\tAv. Almafuerte 5114, Paraná\t3257\tAutos Usados y Nuevos
LEÓN INMOBILIARIA\tINMOBILIARIA\trleonmartillero@hotmail.com\t343 405-1769\tMaipú 428, Paraná\t3200\tMartillero e Inmobiliaria
LIBRERIA JUGUETERIA PICHI\tLIBRERIA Y JUGUETERIA\tlibreriajugueteriapichi@hotmail.com\t343 4651800\tAv. San Martín 638, Paraná\t2998\tLibrería y Juguetes
LIBRERIA DEL ATENEO\tLIBRERIA\tlibreriaateneoparana@gmail.com\t343 4505154\tBuenos Aires 32, Paraná\t1104\tLibrería y Textos
LIVE ROCK\tGASTRONOMIA\tliverockparana@gmail.com\t343 4541005\tGral. José de San Martín 1001, Paraná\t2013\tResto Bar
LOMA NEGRA C.I.A.S.A\tCEMENTERA E INDUSTRIA\tjorge.rodriguez@lomanegra.com.ar\t343 5129251\tAv. de las Américas 5296, Paraná\t1767\tCemento y Hormigón
LONGVIE S.A\tELECTRODOMESTICOS\tlmena@longvie.com.ar\t11 4709-8500\tParque Industrial, Paraná\t1980\tFábrica de Cocinas y Calefones
LORJES ESTACIONAMIENTO\tCOCHERAS Y COCHERAS PRIVADAS\tmpatriciamerlo@hotmail.com\t343 450-4413\t25 de Mayo 220, Paraná\t2810\tEstacionamiento
MACUA ALBERTO S.R.L\tCONCESIONARIA DE AUTOS\tmacuaparana@hotmail.com\t343 4230000\tPascual Palma y Echagüe, Paraná\t2307\tConcesionaria Renault
MARAVILLOSO MUNDO\tLIBRERIA INFANTIL\tmaravillosomundoparana@gmail.com\t343 5034053\tGral. José de San Martín 1034, Paraná\t2915\tLibrería y Didácticos
MARIO CAIRO\tCOMERCIO\tmhecairo@gmail.com\t343 4151744\tArturo Illia 223, Paraná\t2660\tComercio
MASTER PLAST S.R.L\tENVASES FLEXIBLES\tmaster.plast@hotmail.com\t343 470-8020\tAntonio Salellas 1708, Paraná\t2843\tEnvases y Plásticos
MATAFUEGOS SAN JORGE\tSEGURIDAD INDUSTRIAL\tmatafuegos-sanjorge@hotmail.com\t343 473-4961\tPres. Juan Domingo Perón 390, Paraná\t2849\tExtintores y Seguridad
MATEOS EDUARDO S.R.L\tESTACION DE SERVICIO\tulises.edumat@gmail.com\t343 623-6356\tGualeguaychú e Illia, Paraná\t2580\tEstación de Servicio
MAURICIO BENINTENDE PERSEO S.R.L\tSASTRERIA Y VESTIMENTA\tbenintende1942@gmail.com\t343 5030121\tGral. José de San Martín 718, Paraná\t2190\tSastrería de Hombre
MEDICAL S.R.L\tSERVICIOS DE SALUD\tgerencia@medicalsrl.com.ar\t343 4548270\tGral. Manuel Belgrano 459, Paraná\t2071\tMedicina Laboral y Salud
MERCADO EL CHARRUA\tMERCADO CONCENTRADOR\tmercadoelcharrua@gmail.com\t343 454-9456\tAv. Almafuerte 3634, San Benito\t2480\tFrutas y Hortalizas Mayorista
MINICLEO SHAYA ZOWE\tINDUMENTARIA\tinfo@minicleo.com.ar\t343 300-5769\tGral. José de San Martín 1023, Paraná\t3179\tModa y Ropa
MK Y COMUNICACIÓN\tMARKETING\tdsach.mkt@gmail.com\t343 467-2294\tLa Rioja 260, Paraná\t3241\tAgencia de Marketing
MODERNA PARANÁ S.A\tSALUD Y OBRAS SOCIALES\tobrassociales@modernaparana.com.ar\t343 4313000\tGral. José de San Martín 1101, Paraná\t1913\tFarmacia y Salud
MOLINOS SAN JOSE S.A\tMOLINO HARINERO\tpagos@molinossanjose.com.ar\t343 4261635\tAntonio Salellas, Paraná\t2477\tHarinas y Derivados
MÓNACO REGALOS\tREGALERIA Y BAZAR\tpamevs@hotmail.com\t343 4549473\tAv. San Martín, Paraná\t3154\tRegalos y Deco
MUEBLERIA PELLEGRINI\tMUEBLERIA\tmpcorreo@gmail.com\t343 4310404\tPellegrini 154, Paraná\t3191\tMueblería
MUNDO ELECTRÓNICO\tELECTRONICA\tpinveninato@gmail.com\t343 4225134\tLeandro N. Alem 915, Paraná\t2919\tElectrónica y Audio
MUNDO MUEBLES\tMUEBLES Y COLCHONES\tmundomueblesparana@gmail.com\t343 6202143\tAv. Churruarín 1244, Paraná\t3256\tMueblería y Hogar
MY SANDY SANDY\tINDUMENTARIA\tmysandytarj@gmail.com\t343 4486420\tGral. Justo José de Urquiza 1062, Paraná\t891\tModa Femenina
MYKONOS BOUTIQUE\tINDUMENTARIA\tmariarro85@hotmail.com\t343 503-5050\tGral. José de San Martín 709, Paraná\t3125\tBoutique
NAIMAN FOODS S.A\tALIMENTOS EXPORTACION\tsaraines@naimanfoods.com.ar\t343 4052385\tAv. Almafuerte 2459, Paraná\t2710\tAlimentos y Exportación
ÑANDUBAY S.R.L\tTRANSPORTE Y LOGISTICA\tfacturacion@transportesnandubay.com\t343 4646580\tBlas Parera 1083, Paraná\t2154\tTransporte de Cargas
NARELLA TIENDA\tINDUMENTARIA\tcmorvidone@yahoo.com.ar\t343 465-8297\tGral. Sarobe 797, Paraná\t3034\tTienda de Ropa
NATION AUTOMOTORES\tCONCESIONARIA DE AUTOS\tricardo.esper@nation.com.ar\t343 460-7353\tAv. Almafuerte 641, Paraná\t3231\tConcesionaria Oficial Peugeot
NEXO S.A\tABERTURAS Y METALURGICA\tgerencia@nexo-aberturas.com.ar\t343 4261800\tV. Torras 4754, Paraná\t2316\tFábrica de Aberturas
NIMSI GARCIA\tVERDULERIA Y FRUTERIA\tnimsigarcia2@hotmail.com\t343 501-9834\tEspaña 45, Paraná\t3247\tVerdulería
ÓPTICA CRILLÓN\tOPTICA\tcrillon@hotmail.com\t343 4776020\tGualeguaychú 481, Paraná\t2775\tÓptica y Contactología
ÓPTICA CYNTHIA Y LUIS CORREA\tOPTICA\tcorreacyloptica@gmail.com\t343 4581187\tCervantes 72, Paraná\t2027\tÓptica
ÓPTICA MORELLI S.R.L\tOPTICA\topticamorelli@gmail.com\t343 6111653\t25 de Junio 28, Paraná\t206\tÓptica
ÓPTICA SCHELHAS\tOPTICA\tschellhasparana@gmail.com\t343 4715911\tGral. Justo José de Urquiza 1043, Paraná\t3167\tÓptica
ORCU CRÉDITOS\tFINANCIERA\tcomercial@orcucreditos.com.ar\t343 404-8751\tPerú 101, Paraná\t3202\tCréditos
ORTOPEDIA CENTRO\tORTOPEDIA Y SALUD\tortopediacentropna@hotmail.com\t343 518-9914\tCervantes 76, Paraná\t2862\tArtículos Ortopédicos
OSCAR B. GONZALEZ S.R.L\tMOTOS Y TALLER\tobgsrl@hotmail.com\t343 4318290\tGualeguaychú 444, Paraná\t2312\tVenta de Motos
PAPELERIA EL CUYANO\tPAPELERIA Y LIBRERIA\tpagos.elcuyano@hotmail.com\t343 4622596\tPellegrini 387, Paraná\t1917\tPapelería Comercial
PARANÁ REPRESENTACIONES (ETMAN) S.R.L\tREPUESTOS AUTOMOTOR\tcobranzasparana@etman.com.ar\t343 4350537\tAv. Francisco Ramírez 4753, Paraná\t2953\tAutopartes Mayorista
PARANÁ SANITARIOS S.R.L\tSANITARIOS Y GRIFERIAS\tparanasanitarios@yahoo.com.ar\t343 4710009\tEnrique Carbó 499, Paraná\t2895\tSanitarios
PET LAND VETERINARIA\tVETERINARIA Y PET SHOP\tpetlandcontable@gmail.com\t343 5121512\tEnrique Carbó 299, Paraná\t3128\tVeterinaria
PIEDRAS BLANCAS S.A\tYESERIA Y CONSTRUCCION\tyesopiedrasblancas@gmail.com\t343 4342574\t3 de Febrero 634, Paraná\t2087\tYesos y Construcción
PILAY S.A\tINVERSIONES INMOBILIARIAS\tpilayparana@pilay.com.ar\t343 5222887\tAlameda de la Federación 290, Paraná\t2413\tFideicomisos Inmobiliarios
PLATINO ACCESORIOS\tMARROQUINERIA Y MODA\tplatinoargentina@gmail.com\t343 509-2481\tGral. José de San Martín 680, Paraná\t3172\tBolsos y Accesorios
POLELKA LADISLAO Y CIA\tPRODUCCION ALIMENTOS\tagustinapagos.popelka@gmail.com\t343 457-2931\tRuta 11 Km 4.5, Paraná\t2157\tAlimentos
PROVINCIAS UNIDAS S.R.L\tESTACION DE SERVICIO\tpunidas@hotmail.com\t343 4240204\tProvincias Unidas 683, Paraná\t2682\tCombustibles
PRÜNE\tMARROQUINERIA Y CALZADO\tpruneparana@hotmail.com.ar\t343 475-5695\tCervantes 24, Paraná\t3173\tCarteras y Calzado
Q BIEN INDUMENTARIA\tINDUMENTARIA\tatrimer@yahoo.com.ar\t343 622-0243\tParaná Centro\t1726\tIndumentaria
RAWSON IMAGENES S.R.L\tDIAGNOSTICO POR IMAGENES\tvalerialopez@rawsonimagenes.com.ar\t343 463-8166\tEnrique Carbó 531, Paraná\t2855\tSalud y Diagnóstico
RCPTEAN RATAIL INSUMOS GRÁFICOS\tINSUMOS GRAFICOS\tgarciandiagustavo@gmail.com\t343 510-2000\tNogoyá 50, Paraná\t3229\tGráfica e Insumos
RÍO URUGUAY SEGUROS (RUS)\tSEGUROS\tagenciaparque@segurosmarco.com.ar\t343 5191895\tGualeguaychú 599, Paraná\t1957\tCooperativa de Seguros
RIOMAT S.A (BERCOMAT)\tMATERIALES DE CONSTRUCCION\tventas@riomat.com.ar\t343 4218441\tEnrique Carbó 540, Paraná\t1981\tCorralón y Terminaciones
ROXANA BEJAR - TIENDA EL MAGO\tINDUMENTARIA Y UNIFORMES\ttiendaelmago@hotmail.com\t343 4252604\tGral. José de San Martín 1177, Paraná\t2969\tUniformes Escolares y Ropa
SAN CRISTOBAL CAJA MUTUAL\tSEGUROS Y MUTUAL\tm.cesari@sancristobalcaja.com.ar\t343 5320680\tGualeguaychú 305, Paraná\t472\tSeguros y Mutual
SANATORIO LA ENTRERRIANA\tSALUD Y SANATORIO\tcontacto@slaentrerriana.com.ar\t343 5014102\tBuenos Aires 550, Paraná\t2364\tSanatorio Médico
SCARPE ROMINA\tCALZADO\tscarperomina@hotmail.com\t343 438-8352\tAv. San Martín, Paraná\t3155\tZapatería
SE.SE.VI S.R.L\tSERVICIOS SOCIALES\tadministracion@sesevi.com.ar\t343 613-4000\tLeandro N. Alem 436, Paraná\t2679\tServicios Sociales y Sepelios
SELPLAST S.A\tLIBRERIA Y PAPELERIA\tadministracion@selplast.com.ar\t343 446-9131\tEspaña 187, Paraná\t986\tLibrería Mayorista
SENTIR LO NUESTRO - ARAI\tYERBATERIA Y REGIONALES\taraiparana@gmail.com\t343 6117157\tAlameda de la Federación 698, Paraná\t3226\tYerbas y Regionales
SILVIA BECHIR - HB PRODUCTORES DE SEGUROS\tSEGUROS\tsilviabechir@hbproductoresdeseguros.com\t343 4385619\tAv. Francisco Ramírez 5393, Paraná\t3234\tAsesora de Seguros
SILVINA SAUCEDO\tSERVICIOS PROFESIONALES\tsilvi.saucedo@hotmail.com\t343 428-1997\tConde de Gena 2048, Paraná\t3069\tServicios
SOCIEDAD COMERCIAL ELECTRICA S.A\tMATERIALES ELECTRICOS\tventas@scedigital.com.ar\t343 4637118\tGualeguaychú 657, Paraná\t2726\tElectricidad e Iluminación
SOS LA ALBORADA DEL SUD S.A\tEMERGENCIAS MEDICAS\tadministracion@sosemergencias.com.ar\t343 4233333\tCura Álvarez 574, Paraná\t2100\tEmergencias y Ambulancias
SUELITAS ZAPATERIA\tCALZADO\tsuelitas1982@outlook.com\t343 5308412\tGral. José de San Martín 1047, Paraná\t3165\tZapatería
SYS COMPUTACIÓN\tINFORMATICA Y COMPUTACION\tventas@syscomputacion.com.ar\t343 6235740\tAndrés Pazos 700, Paraná\t2091\tComputación y Servicio Técnico
TAUROC\tREVESTIMIENTOS ANTIHUMEDAD\tcontacto@tauroc.com.ar\t343 5047523\tRoque Sáenz Peña 4971, Paraná\t2929\tRevestimientos y Placas
TEQUILA - 47 STREET\tINDUMENTARIA JUVENIL\tgabita.68@hotmail.com\t343 4154959\tCervantes 35, Paraná\t3192\tRopa Juvenil
THE MUSIC STORE\tINSTRUMENTOS MUSICALES\tinfo@themusicstore.com.ar\t11 5913-9904\tGualeguaychú 262, Paraná\t3061\tMúsica y Sonido
TODO FRENO\tMECANICA Y FRENOS\ttodofrenoparana@hotmail.com\t343 456-6661\tAv. Churruarín 27, Paraná\t2235\tFrenos y Embragues
TRANSPORTE GOTTIG S.R.L\tTRANSPORTE DE COMBUSTIBLES\tadmin@mgottig.com\t343 4951051\tRuta 12 Km 404, Crespo\t2603\tTransporte de Cargas Peligrosas
TRAPOTECA SAS\tCOMERCIO Y TEXTIL\tclaudiazaha@yahoo.com.ar\t343 419-7279\tEspaña 89, Paraná\t2734\tTelas e Indumentaria
UOMO LIBRE\tINDUMENTARIA MASCULINA\tuomo.libre@live.com\t343 469-6887\tGral. José de San Martín 1055, Paraná\t3233\tModa Hombre
VAI DECO\tDECORACION Y BAZAR\tpaohabib@hotmail.com\t343 5044007\tBuenos Aires 129, Paraná\t3190\tBazar y Diseño
VALENTINUZ ABERTURAS S.A\tABERTURAS Y REPUESTOS\tadministracion@valentinuzhnos.com\t343 4808378\tAv. Almafuerte 749, Paraná\t2076\tAberturas de Aluminio
VALMOTORS\tCONCESIONARIA DE AUTOS\tlrimolo@valmotors.com.ar\t343 424-1100\tAv. Almafuerte 807, Paraná\t2834\tConcesionaria Fiat
VECTOR HOMO\tINDUMENTARIA\tvectorhomo@fibertel.com.ar\t343 698-6796\tBuenos Aires 147, Paraná\t2723\tIndumentaria Masculina
VENTURI HNOS. S.A.C.I.F\tHIDRAULICA E INDUSTRIA\tinfo@venturi.com.ar\t343 4243048\tAv. Almafuerte 577, Paraná\t1003\tSistemas Hidráulicos
VIANDA SANA PARANÁ\tGASTRONOMIA Y CATERING\tinfo@viandasanaparana.com.ar\t343 405-7653\tBlvd. Eduardo Racedo 227 bis, Paraná\t3245\tViandas Saludables
VICOER LTDA\tCOOPERATIVA DE VIVIENDAS\tvicoer@fibercorp.com.ar\t343 6111718\tSebastián Vázquez 301, Paraná\t2408\tVivienda y Cooperativismo
VICTORIA ANDREANI\tLOGISTICA Y CORREO\tsucparmost@andreani.com\t343 4574746\tAlmte. Guillermo Brown 1182, Paraná\t3210\tServicios Postales y Paquetería
VICTORIA SCHNEIDER\tESTETICA Y BELLEZA\tmvictoriaschneider@gmail.com\t343 518-3489\tJorge Luis Borges 8, Paraná\t3238\tCentro de Estética
VIDRIERA MARIA REINA\tVIDRIERIA Y ESPEJOS\tvidrieriamariareina@yahoo.com.ar\t343 436-2493\tAv. Almafuerte 2201, Paraná\t2933\tCristales y Vidrios
VOXA S.A\tSERVICIOS EMPRESARIALES\tgustavo.lopezcolombo@voxa.com.ar\t343 431-8802\tEcuador 90, Paraná\t3151\tConsultoría y Negocios
WEEKEND TRAVEL EVYT\tAGENCIA DE VIAJES\tsbel@weekendtravel.com.ar\t343 468-5030\tHipólito Yrigoyen 85, Paraná\t3094\tTurismo y Paquetes
WIN S.R.L (DIRECTV AGENTE AUTORIZADO)\tTELECOMUNICACIONES\twinsrl.rrhh@gmail.com\t343 416-8236\tAv. Almafuerte 4230, Paraná\t2696\tServicios Satelitales DIRECTV
YASU CERVECERIA S.R.L\tCERVECERIA Y GASTRONOMIA\tcerveceria.yasu@gmail.com\t343 620-4128\tPres. Juan Domingo Perón 158, Paraná\t3224\tCerveza Artesanal y Bar
ZEN S.A\tESTACION DE SERVICIO\tzensa@gigared.com\t343 466-3818\tEnrique Carbó 878, Paraná\t2866\tCombustibles y Lubricantes`;

function categorize(rubro) {
  const r = rubro.toLowerCase();
  if (r.includes('industria') || r.includes('fabrica') || r.includes('molino') || r.includes('cemento') || r.includes('metalurgica') || r.includes('acero')) {
    return 'Gran Industria';
  }
  if (r.includes('distribuidora') || r.includes('mayorista') || r.includes('concesionaria') || r.includes('banco') || r.includes('clinica') || r.includes('sanatorio') || r.includes('estacion de servicio') || r.includes('combustible') || r.includes('cooperativa') || r.includes('transporte') || r.includes('seguro')) {
    return 'Mediana Empresa';
  }
  if (r.includes('servicios') || r.includes('inmobiliaria') || r.includes('consultoria') || r.includes('educacion') || r.includes('juridicos') || r.includes('salud') || r.includes('marketing') || r.includes('informatica')) {
    return 'Servicios';
  }
  return 'Pequeño Comercio';
}

const lines = csvRaw.trim().split('\n');
const serverDataPath = path.resolve('server_data.json');
const currentData = JSON.parse(fs.readFileSync(serverDataPath, 'utf8'));

if (!currentData.socios) currentData.socios = [];

const existingNames = new Set(currentData.socios.map(s => s.razonSocial.toLowerCase().trim()));

let addedCount = 0;

lines.forEach((line, index) => {
  const parts = line.split('\t');
  if (parts.length < 5) return;
  const [razonSocial, rubro, email, phone, direccion, numSocio, subrubro] = parts;
  
  const cleanName = razonSocial.trim();
  if (existingNames.has(cleanName.toLowerCase())) {
    return;
  }

  const num = numSocio ? numSocio.trim().padStart(4, '0') : String(2000 + index);
  const cuit = `30-71${String(num).slice(-4)}829-4`;
  const categoria = categorize(rubro);
  const id = `socio-cecip-${numSocio ? numSocio.trim() : (index + 10)}`;

  const newSocio = {
    id,
    razonSocial: cleanName,
    nombreComercial: subrubro ? `${cleanName} (${subrubro.trim()})` : cleanName,
    cuit,
    rubro: rubro.trim(),
    categoria,
    estado: 'Activo',
    direccion: direccion.trim(),
    localidad: direccion.toLowerCase().includes('crespo') ? 'Crespo' : direccion.toLowerCase().includes('benito') ? 'San Benito' : direccion.toLowerCase().includes('avellaneda') ? 'Colonia Avellaneda' : 'Paraná',
    provincia: 'Entre Ríos',
    email: email.trim(),
    whatsapp: phone.replace(/[^0-9]/g, '').trim(),
    observaciones: `Socio CeCIP N°: ${numSocio ? numSocio.trim() : '-'}. Categoría de rubro: ${rubro.trim()}`,
    fechaAlta: '2023-01-15',
    timeline: [
      {
        id: `tl-alta-${id}`,
        tipo: 'sistema',
        titulo: 'Socio Oficial CeCIP',
        descripcion: `Padrón activo socio N° ${numSocio ? numSocio.trim() : '-'}. Rubro: ${rubro.trim()}.`,
        fecha: '2023-01-15T09:00:00Z',
        usuario: 'Administración CeCIP'
      }
    ]
  };

  currentData.socios.push(newSocio);
  existingNames.add(cleanName.toLowerCase());
  addedCount++;
});

fs.writeFileSync(serverDataPath, JSON.stringify(currentData, null, 2), 'utf8');
console.log(`Socios incorporados con éxito: ${addedCount}. Total actual: ${currentData.socios.length}`);
